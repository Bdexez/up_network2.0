import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DocumentType,
  InvoiceStatus,
  InvoiceType,
  Prisma,
} from '@prisma/client';
import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentLinesService } from 'src/common/documents/lines.service';
import { NumberingService } from 'src/common/documents/numbering.service';
import {
  assertEditable,
  assertTransition,
} from 'src/common/documents/workflow';
import { assertVersion } from 'src/common/documents/optimistic-lock';
import { computeDocumentTotals, round2 } from 'src/common/documents/totals';
import {
  computeDueDate,
  resolvePaymentTermsDays,
} from 'src/common/documents/payment-terms';
import { MailService } from 'src/common/mail/mail.service';
import { invoiceEmail, reminderEmail } from 'src/common/mail/templates';
import { daysOverdue } from 'src/modules/reports/aging';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { resolveCurrency, toBaseAmounts } from 'src/common/documents/currency';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { creditableAmount } from './credit-notes';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  INVOICE_EDITABLE,
  INVOICE_STATUS_LABEL,
  INVOICE_TRANSITIONS,
} from './invoice-status';
import {
  DocumentPdfService,
  requireExistingPdf,
  resolveDocumentPath,
} from 'src/common/documents/document-pdf.service';

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
  creditNotes: {
    select: { id: true, ref: true, status: true, totalTTC: true },
  },
  creditedInvoice: { select: { id: true, ref: true } },
} satisfies Prisma.InvoiceInclude;

/** Une facture n'est « en retard » que tant qu'elle n'est pas soldée. */
const OVERDUE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.UNPAID,
  InvoiceStatus.PARTIALLY_PAID,
];

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private numbering: NumberingService,
    private linesService: DocumentLinesService,
    private pdfService: DocumentPdfService,
    private mailService: MailService,
  ) {}

  async create(companyId: number, userId: number, dto: CreateInvoiceDto) {
    await this.assertPartner(companyId, dto.partnerId);
    const built = await this.linesService.build(companyId, dto.lines);

    const date = dto.date ? new Date(dto.date) : new Date();
    // Sans échéance explicite, on applique les conditions de règlement.
    const dueDate = dto.dueDate
      ? new Date(dto.dueDate)
      : await this.defaultDueDate(companyId, dto.partnerId, date);

    const money = await this.resolveDocumentCurrency(companyId, dto, built);

    return this.prisma.$transaction(async (tx) => {
      const ref = await this.numbering.next(
        tx,
        companyId,
        DocumentType.INVOICE,
      );

      return tx.invoice.create({
        data: {
          ref,
          companyId,
          partnerId: dto.partnerId,
          createdById: userId,
          date,
          dueDate,
          notes: dto.notes,
          totalHT: built.totalHT,
          totalVat: built.totalVat,
          totalTTC: built.totalTTC,
          ...money,
          lines: { create: built.lines },
        },
        include: INVOICE_INCLUDE,
      });
    });
  }

  findAll(
    companyId: number,
    filters: {
      status?: InvoiceStatus;
      partnerId?: number;
      overdue?: boolean;
    } & PageParams,
  ) {
    const where: Prisma.InvoiceWhereInput = { companyId };
    if (filters.partnerId) where.partnerId = filters.partnerId;

    if (filters.overdue) {
      where.dueDate = { lt: new Date() };
      // « En retard » se croise avec le statut demandé au lieu de l'écraser :
      // demander « réglées et en retard » rend une liste vide, et non la
      // liste des impayées.
      where.status = {
        in: filters.status
          ? OVERDUE_STATUSES.filter((status) => status === filters.status)
          : OVERDUE_STATUSES,
      };
    } else if (filters.status) {
      where.status = filters.status;
    }

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.invoice.findMany({
          where,
          include: {
            partner: { select: { id: true, name: true } },
            order: { select: { id: true, ref: true } },
            // Les avoirs déjà émis servent à la liste : sans eux, l'interface
            // proposerait « Avoir » sur une facture entièrement avoirée.
            creditNotes: {
              select: { id: true, ref: true, status: true, totalTTC: true },
            },
            _count: { select: { payments: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.invoice.count({ where }),
      ]),
    );
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
    // Filet supplémentaire : un brouillon ne devrait jamais porter de
    // règlement, mais on refuse d'en réécrire les lignes si c'était le cas.
    this.assertNoSettledPayments(invoice, 'de modifier');
    assertVersion(invoice, dto.version);

    if (dto.partnerId) await this.assertPartner(companyId, dto.partnerId);

    const built = dto.lines
      ? await this.linesService.build(companyId, dto.lines)
      : null;

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
          version: { increment: 1 },
          partnerId: dto.partnerId,
          date: dto.date ? new Date(dto.date) : undefined,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          notes: dto.notes,
          ...(built
            ? {
                totalHT: built.totalHT,
                totalVat: built.totalVat,
                totalTTC: built.totalTTC,
                ...toBaseAmounts(built, invoice.exchangeRate),
              }
            : {}),
        },
        include: INVOICE_INCLUDE,
      });
    });
  }

  /**
   * Émet un avoir rattaché à une facture. C'est la seule façon de corriger
   * une facture encaissée : l'originale reste intacte, l'avoir porte la
   * correction — c'est ce qu'attend la comptabilité.
   */
  async createCreditNote(
    companyId: number,
    userId: number,
    invoiceId: number,
    dto: CreateCreditNoteDto,
  ) {
    const invoice = await this.findOne(companyId, invoiceId);

    if (invoice.type === InvoiceType.CREDIT_NOTE) {
      throw new BadRequestException('Un avoir ne peut pas être avoiré');
    }
    if (invoice.status === InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Cette facture est encore en brouillon : modifiez-la directement',
      );
    }

    const built = dto.lines
      ? await this.linesService.build(companyId, dto.lines)
      : this.linesService.toPersistable(invoice.lines);

    const creditable = creditableAmount(invoice.totalTTC, invoice.creditNotes);

    if (creditable <= 0) {
      throw new BadRequestException(
        `La facture ${invoice.ref} est déjà entièrement avoirée`,
      );
    }
    if (built.totalTTC > creditable) {
      throw new BadRequestException(
        `L'avoir (${built.totalTTC.toFixed(2)} €) dépasse le montant encore avoirable ` +
          `(${creditable.toFixed(2)} € sur ${invoice.totalTTC.toFixed(2)} €)`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const ref = await this.numbering.next(
        tx,
        companyId,
        DocumentType.CREDIT_NOTE,
      );

      return tx.invoice.create({
        data: {
          ref,
          type: InvoiceType.CREDIT_NOTE,
          // Un avoir naît validé : il n'y a rien à préparer, il corrige.
          status: InvoiceStatus.UNPAID,
          companyId,
          partnerId: invoice.partnerId,
          createdById: userId,
          creditedInvoiceId: invoice.id,
          date: new Date(),
          notes: dto.reason ?? `Avoir sur la facture ${invoice.ref}`,
          totalHT: built.totalHT,
          totalVat: built.totalVat,
          totalTTC: built.totalTTC,
          // L'avoir est libellé comme la facture qu'il corrige.
          currency: invoice.currency,
          exchangeRate: invoice.exchangeRate,
          ...toBaseAmounts(built, invoice.exchangeRate),
          lines: { create: built.lines },
        },
        include: INVOICE_INCLUDE,
      });
    });
  }

  /**
   * Envoie la facture au client, PDF joint.
   *
   * La réponse indique si le message est réellement parti : sans configuration
   * SMTP, il est seulement journalisé, et l'appelant doit pouvoir le dire à
   * l'utilisateur plutôt que d'afficher un faux succès.
   */
  async send(
    companyId: number,
    id: number,
    options: { reminder?: boolean } = {},
  ) {
    const invoice = await this.findOne(companyId, id);

    if (invoice.status === InvoiceStatus.DRAFT) {
      throw new BadRequestException('Validez la facture avant de l’envoyer');
    }

    const recipient = invoice.partner.email;
    if (!recipient) {
      throw new BadRequestException(
        `Le client ${invoice.partner.name} n'a pas d'adresse e-mail`,
      );
    }

    const pdf = await this.pdfService.build({
      kind: 'INVOICE',
      companyId,
      ref: invoice.ref,
      date: invoice.date,
      secondaryDate: invoice.dueDate,
      notes: invoice.notes,
      issuer: invoice.company,
      recipient: invoice.partner,
      lines: invoice.lines,
      vatBreakdown: invoice.vatBreakdown,
      totalHT: invoice.totalHT,
      totalVat: invoice.totalVat,
      totalTTC: invoice.totalTTC,
      paidAmount: invoice.paidAmount,
    });

    const amount = `${invoice.remainingAmount.toFixed(2)} ${invoice.currency}`;
    const context = {
      companyName: invoice.company.name,
      partnerName: invoice.partner.name,
      ref: invoice.ref,
      amount,
      dueDate: invoice.dueDate?.toLocaleDateString('fr-FR') ?? null,
    };

    const body = options.reminder
      ? reminderEmail({
          ...context,
          level: invoice.reminderCount + 1,
          daysOverdue: daysOverdue(invoice.dueDate, new Date()),
        })
      : invoiceEmail(context);

    const result = await this.mailService.send({
      to: recipient,
      ...body,
      attachments: [
        {
          filename: `${invoice.ref}.pdf`,
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    });

    await this.prisma.invoice.update({
      where: { id },
      data: {
        sentAt: new Date(),
        ...(options.reminder
          ? { reminderCount: { increment: 1 }, lastReminderAt: new Date() }
          : {}),
      },
    });

    return { ...result, to: recipient, subject: body.subject };
  }

  async changeStatus(companyId: number, id: number, status: InvoiceStatus) {
    const invoice = await this.findOne(companyId, id);
    assertTransition(
      invoice.status,
      status,
      INVOICE_TRANSITIONS,
      INVOICE_STATUS_LABEL,
    );

    // Repasser en brouillon rouvrirait les lignes à l'édition ; annuler ferait
    // disparaître une créance déjà partiellement encaissée.
    if (status === InvoiceStatus.DRAFT || status === InvoiceStatus.CANCELLED) {
      this.assertNoSettledPayments(
        invoice,
        status === InvoiceStatus.DRAFT
          ? 'de repasser en brouillon'
          : "d'annuler",
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status, version: { increment: 1 } },
      include: INVOICE_INCLUDE,
    });
  }

  /** (Re)génère et conserve le PDF de la facture. */
  async generatePdf(companyId: number, id: number) {
    const invoice = await this.findOne(companyId, id);

    const storedPath = await this.pdfService.save({
      kind: 'INVOICE',
      companyId,
      ref: invoice.ref,
      date: invoice.date,
      secondaryDate: invoice.dueDate,
      notes: invoice.notes,
      issuer: invoice.company,
      recipient: invoice.partner,
      lines: invoice.lines,
      vatBreakdown: invoice.vatBreakdown,
      totalHT: invoice.totalHT,
      totalVat: invoice.totalVat,
      totalTTC: invoice.totalTTC,
      paidAmount: invoice.paidAmount,
    });

    return this.prisma.invoice.update({
      where: { id },
      data: { pdfUrl: storedPath },
      select: { id: true, ref: true, pdfUrl: true },
    });
  }

  /** Chemin absolu du PDF, généré à la volée s'il n'existe pas encore. */
  async getPdfPath(companyId: number, id: number) {
    const invoice = await this.findOne(companyId, id);

    const existing = resolveDocumentPath(invoice.pdfUrl);
    if (!existing || !fs.existsSync(existing)) {
      await this.generatePdf(companyId, id);
    }

    const refreshed = await this.prisma.invoice.findUniqueOrThrow({
      where: { id },
      select: { pdfUrl: true },
    });

    return {
      filePath: requireExistingPdf(refreshed.pdfUrl),
      fileName: `${invoice.ref}.pdf`,
    };
  }

  async remove(companyId: number, id: number) {
    const invoice = await this.findOne(companyId, id);
    assertEditable(invoice.status, INVOICE_EDITABLE, INVOICE_STATUS_LABEL);
    this.assertNoSettledPayments(invoice, 'de supprimer');
    this.assertNoCreditNotes(invoice);

    const filePath = resolveDocumentPath(invoice.pdfUrl);
    if (filePath && fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath).catch(() => undefined);
    }

    await this.prisma.invoice.delete({ where: { id } });
    return { message: `Facture ${invoice.ref} supprimée` };
  }

  // ---------------------------------------------------------------------------

  /**
   * Une facture encaissée est une écriture comptable : on ne la réécrit pas,
   * on la corrige par un avoir. Le message indique la sortie possible.
   */
  /** Les avoirs rattachés interdisent de toucher à la facture d'origine. */
  private assertNoCreditNotes(invoice: {
    ref: string;
    creditNotes?: { ref: string }[];
  }) {
    const notes = invoice.creditNotes ?? [];
    if (notes.length > 0) {
      throw new BadRequestException(
        `La facture ${invoice.ref} est corrigée par ${notes.map((n) => n.ref).join(', ')} : ` +
          'supprimez d’abord le ou les avoirs.',
      );
    }
  }

  private assertNoSettledPayments(
    invoice: { ref: string; paidAmount: number; payments?: { id: number }[] },
    /** Fragment déjà élidé : « de modifier », « d'annuler »… */
    action: string,
  ) {
    const settled =
      invoice.paidAmount > 0 || (invoice.payments?.length ?? 0) > 0;
    if (!settled) return;

    throw new BadRequestException(
      `Impossible ${action} la facture ${invoice.ref} : ` +
        `${invoice.paidAmount.toFixed(2)} € ont été encaissés. ` +
        'Supprimez d’abord les règlements, ou émettez un avoir.',
    );
  }

  /** Échéance déduite des conditions de règlement du tiers, sinon de la société. */
  private async defaultDueDate(
    companyId: number,
    partnerId: number,
    issuedAt: Date,
  ) {
    const [company, partner] = await Promise.all([
      this.prisma.company.findUniqueOrThrow({
        where: { id: companyId },
        select: { paymentTermsDays: true },
      }),
      this.prisma.partner.findUniqueOrThrow({
        where: { id: partnerId },
        select: { paymentTermsDays: true },
      }),
    ]);

    return computeDueDate(
      issuedAt,
      resolvePaymentTermsDays(
        partner.paymentTermsDays,
        company.paymentTermsDays,
      ),
    );
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
