import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType, OrderStatus, Prisma, QuoteStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentLinesService } from 'src/common/documents/lines.service';
import { NumberingService } from 'src/common/documents/numbering.service';
import {
  assertEditable,
  assertTransition,
} from 'src/common/documents/workflow';
import { assertVersion } from 'src/common/documents/optimistic-lock';
import { computeDocumentTotals } from 'src/common/documents/totals';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { resolveCurrency, toBaseAmounts } from 'src/common/documents/currency';
import { DocumentPdfService } from 'src/common/documents/document-pdf.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import {
  QUOTE_EDITABLE,
  QUOTE_STATUS_LABEL,
  QUOTE_TRANSITIONS,
} from './quote-status';

const QUOTE_INCLUDE = {
  partner: { select: { id: true, name: true, email: true, city: true } },
  createdBy: { select: { id: true, username: true } },
  lines: { orderBy: { position: 'asc' } },
  orders: { select: { id: true, ref: true, status: true } },
} satisfies Prisma.QuoteInclude;

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private numbering: NumberingService,
    private linesService: DocumentLinesService,
    private pdfService: DocumentPdfService,
  ) {}

  async create(companyId: number, userId: number, dto: CreateQuoteDto) {
    await this.assertPartner(companyId, dto.partnerId);
    const built = await this.linesService.build(companyId, dto.lines);

    const money = await this.resolveDocumentCurrency(companyId, dto, built);

    return this.prisma.$transaction(async (tx) => {
      const ref = await this.numbering.next(tx, companyId, DocumentType.QUOTE);

      return tx.quote.create({
        data: {
          ref,
          companyId,
          partnerId: dto.partnerId,
          createdById: userId,
          date: dto.date ? new Date(dto.date) : new Date(),
          validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
          notes: dto.notes,
          totalHT: built.totalHT,
          totalVat: built.totalVat,
          totalTTC: built.totalTTC,
          ...money,
          lines: { create: built.lines },
        },
        include: QUOTE_INCLUDE,
      });
    });
  }

  findAll(
    companyId: number,
    filters: { status?: QuoteStatus; partnerId?: number } & PageParams,
  ) {
    const where: Prisma.QuoteWhereInput = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.partnerId) where.partnerId = filters.partnerId;

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.quote.findMany({
          where,
          include: QUOTE_INCLUDE,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.quote.count({ where }),
      ]),
    );
  }

  async findOne(companyId: number, id: number) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, companyId },
      include: QUOTE_INCLUDE,
    });
    if (!quote) throw new NotFoundException('Devis introuvable');
    return {
      ...quote,
      vatBreakdown: computeDocumentTotals(quote.lines).vatBreakdown,
    };
  }

  async update(companyId: number, id: number, dto: UpdateQuoteDto) {
    const quote = await this.findOne(companyId, id);
    assertEditable(quote.status, QUOTE_EDITABLE, QUOTE_STATUS_LABEL);
    assertVersion(quote, dto.version);

    if (dto.partnerId) await this.assertPartner(companyId, dto.partnerId);

    const built = dto.lines
      ? await this.linesService.build(companyId, dto.lines)
      : null;

    return this.prisma.$transaction(async (tx) => {
      if (built) {
        // Les lignes sont remplacées en bloc : jamais de total désynchronisé.
        await tx.quoteLine.deleteMany({ where: { quoteId: id } });
        await tx.quoteLine.createMany({
          data: built.lines.map((line) => ({ ...line, quoteId: id })),
        });
      }

      return tx.quote.update({
        where: { id },
        data: {
          version: { increment: 1 },
          partnerId: dto.partnerId,
          date: dto.date ? new Date(dto.date) : undefined,
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
          notes: dto.notes,
          ...(built
            ? {
                totalHT: built.totalHT,
                totalVat: built.totalVat,
                totalTTC: built.totalTTC,
                ...toBaseAmounts(built, quote.exchangeRate),
              }
            : {}),
        },
        include: QUOTE_INCLUDE,
      });
    });
  }

  async changeStatus(companyId: number, id: number, status: QuoteStatus) {
    const quote = await this.findOne(companyId, id);
    assertTransition(
      quote.status,
      status,
      QUOTE_TRANSITIONS,
      QUOTE_STATUS_LABEL,
    );

    return this.prisma.quote.update({
      where: { id },
      data: { status, version: { increment: 1 } },
      include: QUOTE_INCLUDE,
    });
  }

  /**
   * Crée une commande à partir du devis. Les lignes sont recopiées telles
   * quelles : le tarif accepté par le client est celui qui s'applique, même si
   * le catalogue a bougé depuis.
   */
  async convertToOrder(companyId: number, userId: number, id: number) {
    const quote = await this.findOne(companyId, id);
    assertTransition(
      quote.status,
      QuoteStatus.BILLED,
      QUOTE_TRANSITIONS,
      QUOTE_STATUS_LABEL,
    );

    const built = this.linesService.toPersistable(quote.lines);

    return this.prisma.$transaction(async (tx) => {
      const ref = await this.numbering.next(tx, companyId, DocumentType.ORDER);

      const order = await tx.order.create({
        data: {
          ref,
          companyId,
          partnerId: quote.partnerId,
          createdById: userId,
          quoteId: quote.id,
          status: OrderStatus.DRAFT,
          notes: quote.notes,
          totalHT: built.totalHT,
          totalVat: built.totalVat,
          totalTTC: built.totalTTC,
          // La commande hérite de la devise et du taux acceptés au devis.
          currency: quote.currency,
          exchangeRate: quote.exchangeRate,
          ...toBaseAmounts(built, quote.exchangeRate),
          lines: { create: built.lines },
        },
        include: {
          partner: { select: { id: true, name: true } },
          lines: { orderBy: { position: 'asc' } },
        },
      });

      await tx.quote.update({
        where: { id },
        data: { status: QuoteStatus.BILLED },
      });

      return order;
    });
  }

  /**
   * PDF rendu à la volée : un devis reste modifiable, servir un fichier figé
   * risquerait d'envoyer une version périmée.
   */
  async renderPdf(companyId: number, id: number) {
    const quote = await this.findOne(companyId, id);
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
    });
    const partner = await this.prisma.partner.findUniqueOrThrow({
      where: { id: quote.partnerId },
    });

    const buffer = await this.pdfService.build({
      kind: 'QUOTE',
      companyId,
      ref: quote.ref,
      date: quote.date,
      secondaryDate: quote.validUntil,
      notes: quote.notes,
      issuer: company,
      recipient: partner,
      lines: quote.lines,
      vatBreakdown: quote.vatBreakdown,
      totalHT: quote.totalHT,
      totalVat: quote.totalVat,
      totalTTC: quote.totalTTC,
    });

    return { buffer, fileName: `${quote.ref}.pdf` };
  }

  async remove(companyId: number, id: number) {
    const quote = await this.findOne(companyId, id);
    assertEditable(quote.status, QUOTE_EDITABLE, QUOTE_STATUS_LABEL);

    await this.prisma.quote.delete({ where: { id } });
    return { message: `Devis ${quote.ref} supprimé` };
  }

  /**
   * Devise du document et montants convertis. La devise société sert de
   * référence : c'est dans celle-ci que les états consolidés s'additionnent.
   */
  private async resolveDocumentCurrency(
    companyId: number,
    dto: { currency?: string; exchangeRate?: number },
    totals?: { totalHT: number; totalTTC: number },
  ) {
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: { currency: true },
    });

    const context = resolveCurrency(company.currency, dto);
    return {
      ...context,
      ...toBaseAmounts(
        totals ?? { totalHT: 0, totalTTC: 0 },
        context.exchangeRate,
      ),
    };
  }

  private async assertPartner(companyId: number, partnerId: number) {
    const partner = await this.prisma.partner.findFirst({
      where: { id: partnerId, companyId },
      select: { id: true },
    });
    if (!partner) throw new NotFoundException('Client introuvable');
  }
}
