import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType, InvoiceStatus, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentLinesService } from 'src/common/documents/lines.service';
import { NumberingService } from 'src/common/documents/numbering.service';
import { assertEditable, assertTransition } from 'src/common/documents/workflow';
import { computeDocumentTotals, round2 } from 'src/common/documents/totals';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  INVOICE_EDITABLE,
  INVOICE_STATUS_LABEL,
  INVOICE_TRANSITIONS,
} from './invoice-status';
import { INVOICES_DIR, InvoicePdfService } from './invoice-pdf.service';

const INVOICE_INCLUDE = {
  partner: true,
  company: true,
  createdBy: { select: { id: true, username: true } },
  lines: { orderBy: { position: 'asc' } },
  payments: {
    orderBy: { date: 'desc' },
    include: { createdBy: { select: { id: true, username: true } } },
  },
  order: { select: { id: true, ref: true } },
} satisfies Prisma.InvoiceInclude;

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private numbering: NumberingService,
    private linesService: DocumentLinesService,
    private pdfService: InvoicePdfService,
  ) {}

  async create(companyId: number, userId: number, dto: CreateInvoiceDto) {
    await this.assertPartner(companyId, dto.partnerId);
    const built = await this.linesService.build(companyId, dto.lines);

    return this.prisma.$transaction(async (tx) => {
      const ref = await this.numbering.next(tx, companyId, DocumentType.INVOICE);

      return tx.invoice.create({
        data: {
          ref,
          companyId,
          partnerId: dto.partnerId,
          createdById: userId,
          date: dto.date ? new Date(dto.date) : new Date(),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          notes: dto.notes,
          totalHT: built.totalHT,
          totalVat: built.totalVat,
          totalTTC: built.totalTTC,
          lines: { create: built.lines },
        },
        include: INVOICE_INCLUDE,
      });
    });
  }

  findAll(
    companyId: number,
    filters: { status?: InvoiceStatus; partnerId?: number; overdue?: boolean },
  ) {
    const where: Prisma.InvoiceWhereInput = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.partnerId) where.partnerId = filters.partnerId;
    if (filters.overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] };
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        partner: { select: { id: true, name: true } },
        order: { select: { id: true, ref: true } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: number, id: number) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: INVOICE_INCLUDE,
    });
    if (!invoice) throw new NotFoundException('Facture introuvable');

    return {
      ...invoice,
      vatBreakdown: computeDocumentTotals(invoice.lines).vatBreakdown,
      remainingAmount: round2(invoice.totalTTC - invoice.paidAmount),
    };
  }

  async update(companyId: number, id: number, dto: UpdateInvoiceDto) {
    const invoice = await this.findOne(companyId, id);
    assertEditable(invoice.status, INVOICE_EDITABLE, INVOICE_STATUS_LABEL);

    if (dto.partnerId) await this.assertPartner(companyId, dto.partnerId);

    const built = dto.lines ? await this.linesService.build(companyId, dto.lines) : null;

    return this.prisma.$transaction(async (tx) => {
      if (built) {
        await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });
        await tx.invoiceLine.createMany({
          data: built.lines.map((line) => ({ ...line, invoiceId: id })),
        });
      }

      return tx.invoice.update({
        where: { id },
        data: {
          partnerId: dto.partnerId,
          date: dto.date ? new Date(dto.date) : undefined,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          notes: dto.notes,
          ...(built
            ? {
                totalHT: built.totalHT,
                totalVat: built.totalVat,
                totalTTC: built.totalTTC,
              }
            : {}),
        },
        include: INVOICE_INCLUDE,
      });
    });
  }

  async changeStatus(companyId: number, id: number, status: InvoiceStatus) {
    const invoice = await this.findOne(companyId, id);
    assertTransition(invoice.status, status, INVOICE_TRANSITIONS, INVOICE_STATUS_LABEL);

    return this.prisma.invoice.update({
      where: { id },
      data: { status },
      include: INVOICE_INCLUDE,
    });
  }

  /**
   * (Re)génère le PDF. Le fichier est nommé d'après la référence de la facture
   * et écrasé à chaque appel : une facture n'a qu'un seul PDF courant.
   */
  async generatePdf(companyId: number, id: number) {
    const invoice = await this.findOne(companyId, id);

    const fileName = await this.pdfService.render({
      ref: invoice.ref,
      date: invoice.date,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
      company: invoice.company,
      partner: invoice.partner,
      lines: invoice.lines,
      vatBreakdown: invoice.vatBreakdown,
      totalHT: invoice.totalHT,
      totalVat: invoice.totalVat,
      totalTTC: invoice.totalTTC,
      paidAmount: invoice.paidAmount,
    });

    return this.prisma.invoice.update({
      where: { id },
      data: { pdfUrl: fileName },
      select: { id: true, ref: true, pdfUrl: true },
    });
  }

  /** Chemin absolu du PDF, généré à la volée s'il n'existe pas encore. */
  async getPdfPath(companyId: number, id: number) {
    const invoice = await this.findOne(companyId, id);

    let fileName = invoice.pdfUrl ? path.basename(invoice.pdfUrl) : null;
    if (!fileName || !fs.existsSync(path.join(INVOICES_DIR, fileName))) {
      fileName = (await this.generatePdf(companyId, id)).pdfUrl;
    }

    const filePath = this.resolvePdfPath(fileName);
    if (!filePath) throw new NotFoundException('Fichier PDF introuvable');

    return { filePath, fileName: `${invoice.ref}.pdf` };
  }

  async remove(companyId: number, id: number) {
    const invoice = await this.findOne(companyId, id);
    assertEditable(invoice.status, INVOICE_EDITABLE, INVOICE_STATUS_LABEL);

    if (invoice.pdfUrl) {
      const filePath = this.resolvePdfPath(invoice.pdfUrl);
      if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath).catch(() => undefined);
      }
    }

    await this.prisma.invoice.delete({ where: { id } });
    return { message: `Facture ${invoice.ref} supprimée` };
  }

  // ---------------------------------------------------------------------------

  /**
   * Résout un nom de fichier vers le dossier `invoices/`. Seul le basename est
   * conservé : une valeur contenant `../` ou un chemin absolu ne peut pas
   * sortir du dossier.
   */
  private resolvePdfPath(stored: string | null): string | null {
    if (!stored) return null;
    const base = path.basename(stored);
    if (!base || base === '.' || base === '..') return null;
    const resolved = path.join(INVOICES_DIR, base);
    return resolved.startsWith(INVOICES_DIR) ? resolved : null;
  }

  private async assertPartner(companyId: number, partnerId: number) {
    const partner = await this.prisma.partner.findFirst({
      where: { id: partnerId, companyId },
      select: { id: true },
    });
    if (!partner) throw new NotFoundException('Client introuvable');
  }
}
