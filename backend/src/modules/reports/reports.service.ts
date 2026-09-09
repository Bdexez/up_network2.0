import { Injectable } from '@nestjs/common';
import { InvoiceStatus, InvoiceType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { round2 } from 'src/common/documents/totals';
import { buildAgingReport } from './aging';
import { ACCOUNTS, buildFecFile, checkBalance, type FecEntry } from './fec';

/** Statuts d'une facture qui reste à encaisser. */
const OPEN_STATUSES = [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID];

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /** Balance âgée : encours client ventilé par ancienneté du retard. */
  async aging(companyId: number) {
    const invoices = await this.prisma.invoice.findMany({
      where: { companyId, status: { in: OPEN_STATUSES } },
      select: {
        partnerId: true,
        dueDate: true,
        type: true,
        baseTotalTTC: true,
        paidAmount: true,
        exchangeRate: true,
        partner: { select: { name: true } },
      },
    });

    return buildAgingReport(
      invoices.map((invoice) => ({
        partnerId: invoice.partnerId,
        partnerName: invoice.partner.name,
        dueDate: invoice.dueDate,
        // Reste dû en devise société ; un avoir vient en déduction.
        remaining:
          (invoice.type === InvoiceType.CREDIT_NOTE ? -1 : 1) *
          round2(
            invoice.baseTotalTTC - invoice.paidAmount * invoice.exchangeRate,
          ),
      })),
    );
  }

  /** Factures en retard, avec leur niveau de relance déjà atteint. */
  async overdueInvoices(companyId: number) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        type: InvoiceType.INVOICE,
        status: { in: OPEN_STATUSES },
        dueDate: { lt: new Date() },
      },
      include: { partner: { select: { id: true, name: true, email: true } } },
      orderBy: { dueDate: 'asc' },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      ref: invoice.ref,
      partner: invoice.partner,
      dueDate: invoice.dueDate,
      currency: invoice.currency,
      totalTTC: invoice.totalTTC,
      remaining: round2(invoice.totalTTC - invoice.paidAmount),
      reminderCount: invoice.reminderCount,
      lastReminderAt: invoice.lastReminderAt,
    }));
  }

  /** Récapitulatif de TVA collectée et déductible sur une période. */
  async vatSummary(companyId: number, period: { from: Date; to: Date }) {
    const [sales, purchases] = await Promise.all([
      this.prisma.invoice.findMany({
        where: {
          companyId,
          status: { not: InvoiceStatus.DRAFT },
          date: { gte: period.from, lte: period.to },
        },
        select: {
          type: true,
          exchangeRate: true,
          lines: { select: { vatRate: true, totalHT: true, totalVat: true } },
        },
      }),
      this.prisma.purchaseOrder.findMany({
        where: {
          companyId,
          status: { not: 'DRAFT' },
          date: { gte: period.from, lte: period.to },
        },
        select: {
          exchangeRate: true,
          lines: { select: { vatRate: true, totalHT: true, totalVat: true } },
        },
      }),
    ]);

    const collected = new Map<number, { base: number; vat: number }>();
    for (const invoice of sales) {
      const sign = invoice.type === InvoiceType.CREDIT_NOTE ? -1 : 1;
      for (const line of invoice.lines) {
        const bucket = collected.get(line.vatRate) ?? { base: 0, vat: 0 };
        bucket.base = round2(
          bucket.base + sign * line.totalHT * invoice.exchangeRate,
        );
        bucket.vat = round2(
          bucket.vat + sign * line.totalVat * invoice.exchangeRate,
        );
        collected.set(line.vatRate, bucket);
      }
    }

    const deductible = new Map<number, { base: number; vat: number }>();
    for (const order of purchases) {
      for (const line of order.lines) {
        const bucket = deductible.get(line.vatRate) ?? { base: 0, vat: 0 };
        bucket.base = round2(bucket.base + line.totalHT * order.exchangeRate);
        bucket.vat = round2(bucket.vat + line.totalVat * order.exchangeRate);
        deductible.set(line.vatRate, bucket);
      }
    }

    const toRows = (map: Map<number, { base: number; vat: number }>) =>
      [...map.entries()]
        .filter(([rate]) => rate > 0)
        .sort((a, b) => a[0] - b[0])
        .map(([rate, bucket]) => ({ rate, ...bucket }));

    const collectedRows = toRows(collected);
    const deductibleRows = toRows(deductible);

    const totalCollected = round2(
      collectedRows.reduce((acc, r) => acc + r.vat, 0),
    );
    const totalDeductible = round2(
      deductibleRows.reduce((acc, r) => acc + r.vat, 0),
    );

    return {
      period: { from: period.from, to: period.to },
      collected: collectedRows,
      deductible: deductibleRows,
      totalCollected,
      totalDeductible,
      // Positif : TVA à reverser. Négatif : crédit de TVA.
      balance: round2(totalCollected - totalDeductible),
    };
  }

  /**
   * Écritures comptables de la période, au format FEC.
   *
   * Une facture de vente donne trois écritures : le client au débit du TTC,
   * les ventes au crédit du HT, la TVA collectée au crédit. Un règlement en
   * donne deux : banque au débit, client au crédit.
   */
  async fec(companyId: number, period: { from: Date; to: Date }) {
    const [invoices, payments, purchases] = await Promise.all([
      this.prisma.invoice.findMany({
        where: {
          companyId,
          status: { not: InvoiceStatus.DRAFT },
          date: { gte: period.from, lte: period.to },
        },
        include: { partner: { select: { id: true, name: true } } },
        orderBy: { date: 'asc' },
      }),
      this.prisma.payment.findMany({
        where: {
          invoice: { companyId },
          date: { gte: period.from, lte: period.to },
        },
        include: {
          invoice: {
            select: {
              ref: true,
              exchangeRate: true,
              partner: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.purchaseOrder.findMany({
        where: {
          companyId,
          status: { not: 'DRAFT' },
          date: { gte: period.from, lte: period.to },
        },
        include: { supplier: { select: { id: true, name: true } } },
        orderBy: { date: 'asc' },
      }),
    ]);

    const entries: FecEntry[] = [];

    for (const invoice of invoices) {
      const sign = invoice.type === InvoiceType.CREDIT_NOTE ? -1 : 1;
      const ht = round2(sign * invoice.baseTotalHT);
      const vat = round2(sign * (invoice.baseTotalTTC - invoice.baseTotalHT));
      const ttc = round2(sign * invoice.baseTotalTTC);

      const common = {
        journalCode: 'VT',
        journalLabel: 'Ventes',
        entryNumber: invoice.ref,
        entryDate: invoice.date,
        pieceRef: invoice.ref,
        pieceDate: invoice.date,
        label: `${invoice.type === InvoiceType.CREDIT_NOTE ? 'Avoir' : 'Facture'} ${invoice.partner.name}`,
        auxAccountNumber: `C${invoice.partner.id}`,
        auxAccountLabel: invoice.partner.name,
        ...(invoice.currency !== undefined && invoice.exchangeRate !== 1
          ? {
              foreignAmount: invoice.totalTTC,
              foreignCurrency: invoice.currency,
            }
          : {}),
      };

      entries.push(
        {
          ...common,
          accountNumber: ACCOUNTS.customer.number,
          accountLabel: ACCOUNTS.customer.label,
          debit: positive(ttc),
          credit: negative(ttc),
        },
        {
          ...common,
          accountNumber: ACCOUNTS.sales.number,
          accountLabel: ACCOUNTS.sales.label,
          debit: negative(ht),
          credit: positive(ht),
        },
      );

      if (vat !== 0) {
        entries.push({
          ...common,
          accountNumber: ACCOUNTS.vatCollected.number,
          accountLabel: ACCOUNTS.vatCollected.label,
          debit: negative(vat),
          credit: positive(vat),
        });
      }
    }

    for (const payment of payments) {
      const amount = round2(payment.amount * payment.invoice.exchangeRate);
      const common = {
        journalCode: 'BQ',
        journalLabel: 'Banque',
        entryNumber: `REG-${payment.id}`,
        entryDate: payment.date,
        pieceRef: payment.reference ?? payment.invoice.ref,
        pieceDate: payment.date,
        label: `Règlement ${payment.invoice.ref}`,
        auxAccountNumber: `C${payment.invoice.partner.id}`,
        auxAccountLabel: payment.invoice.partner.name,
      };

      entries.push(
        {
          ...common,
          accountNumber: ACCOUNTS.bank.number,
          accountLabel: ACCOUNTS.bank.label,
          debit: amount,
          credit: 0,
        },
        {
          ...common,
          accountNumber: ACCOUNTS.customer.number,
          accountLabel: ACCOUNTS.customer.label,
          debit: 0,
          credit: amount,
        },
      );
    }

    for (const order of purchases) {
      const ht = round2(order.baseTotalHT);
      const vat = round2(order.baseTotalTTC - order.baseTotalHT);
      const ttc = round2(order.baseTotalTTC);

      const common = {
        journalCode: 'AC',
        journalLabel: 'Achats',
        entryNumber: order.ref,
        entryDate: order.date,
        pieceRef: order.ref,
        pieceDate: order.date,
        label: `Commande ${order.supplier.name}`,
        auxAccountNumber: `F${order.supplier.id}`,
        auxAccountLabel: order.supplier.name,
      };

      entries.push(
        {
          ...common,
          accountNumber: ACCOUNTS.purchases.number,
          accountLabel: ACCOUNTS.purchases.label,
          debit: ht,
          credit: 0,
        },
        {
          ...common,
          accountNumber: ACCOUNTS.supplier.number,
          accountLabel: ACCOUNTS.supplier.label,
          debit: 0,
          credit: ttc,
        },
      );

      if (vat !== 0) {
        entries.push({
          ...common,
          accountNumber: ACCOUNTS.vatDeductible.number,
          accountLabel: ACCOUNTS.vatDeductible.label,
          debit: vat,
          credit: 0,
        });
      }
    }

    return { content: buildFecFile(entries), balance: checkBalance(entries) };
  }

  /** Enregistre l'envoi d'une relance et fait monter son niveau. */
  async recordReminder(companyId: number, invoiceId: number) {
    const invoice = await this.prisma.invoice.findFirstOrThrow({
      where: { id: invoiceId, companyId },
      select: { id: true, ref: true, reminderCount: true },
    });

    const updated = await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: { reminderCount: { increment: 1 }, lastReminderAt: new Date() },
      select: {
        id: true,
        ref: true,
        reminderCount: true,
        lastReminderAt: true,
      },
    });

    return updated;
  }
}

/** Un montant signé se répartit entre débit et crédit selon son sens. */
function positive(value: number) {
  return value > 0 ? value : 0;
}

function negative(value: number) {
  return value < 0 ? Math.abs(value) : 0;
}
