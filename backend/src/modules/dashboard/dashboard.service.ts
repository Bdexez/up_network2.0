import { Injectable } from '@nestjs/common';
import {
  ActivityStatus,
  InvoiceStatus,
  InvoiceType,
  LeadStatus,
  OpportunityStage,
  OrderStatus,
  QuoteStatus,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { round2 } from 'src/common/documents/totals';

/** Statuts d'une facture qui reste à encaisser. */
const OPEN_INVOICE_STATUSES = [
  InvoiceStatus.UNPAID,
  InvoiceStatus.PARTIALLY_PAID,
];

/**
 * Un avoir vient en déduction : il ne doit ni gonfler le chiffre d'affaires ni
 * l'encours. On agrège donc séparément et on soustrait.
 *
 * Toutes les sommes portent sur les montants convertis (`baseTotal…`) : un
 * document en dollars et un document en euros ne s'additionnent pas autrement.
 */
const ISSUED = { status: { not: InvoiceStatus.DRAFT } } as const;

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async overview(companyId: number) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      partners,
      products,
      orders,
      revenue,
      monthRevenue,
      invoices,
      outstanding,
      overdueInvoices,
      openQuotes,
      openLeads,
      openOpportunities,
      wonOpportunities,
      overdueActivities,
      lowStock,
    ] = await Promise.all([
      this.prisma.partner.count({ where: { companyId, isActive: true } }),
      this.prisma.product.count({ where: { companyId } }),
      this.prisma.order.count({
        where: { companyId, status: { not: OrderStatus.CANCELLED } },
      }),
      // Le chiffre d'affaires s'appuie sur les factures émises, pas sur les
      // commandes : c'est ce qui est réellement facturé qui compte.
      this.netRevenue({ companyId, ...ISSUED }),
      this.netRevenue({ companyId, ...ISSUED, date: { gte: monthStart } }),
      this.prisma.invoice.count({
        where: { companyId, type: InvoiceType.INVOICE },
      }),
      this.netOutstanding(companyId),
      this.prisma.invoice.count({
        where: {
          companyId,
          type: InvoiceType.INVOICE,
          status: { in: OPEN_INVOICE_STATUSES },
          dueDate: { lt: now },
        },
      }),
      this.prisma.quote.aggregate({
        where: {
          companyId,
          status: { in: [QuoteStatus.VALIDATED, QuoteStatus.SIGNED] },
        },
        _count: { _all: true },
        _sum: { baseTotalHT: true },
      }),
      this.prisma.lead.count({
        where: {
          companyId,
          status: { notIn: [LeadStatus.CONVERTED, LeadStatus.UNQUALIFIED] },
        },
      }),
      this.prisma.opportunity.aggregate({
        where: {
          companyId,
          stage: { notIn: [OpportunityStage.WON, OpportunityStage.LOST] },
        },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      this.prisma.opportunity.aggregate({
        where: { companyId, stage: OpportunityStage.WON },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      this.prisma.activity.count({
        where: {
          companyId,
          status: ActivityStatus.PLANNED,
          dueDate: { lt: now },
        },
      }),
      this.countLowStock(companyId),
    ]);

    return {
      partners,
      products,
      orders,
      invoices,
      revenue,
      monthRevenue,
      outstandingAmount: outstanding,
      overdueInvoices,
      openQuotes: openQuotes._count._all,
      openQuotesAmount: round2(openQuotes._sum.baseTotalHT ?? 0),
      openLeads,
      openOpportunities: openOpportunities._count._all,
      openPipelineAmount: round2(openOpportunities._sum.amount ?? 0),
      wonOpportunities: wonOpportunities._count._all,
      wonAmount: round2(wonOpportunities._sum.amount ?? 0),
      overdueActivities,
      lowStock,
    };
  }

  /** Chiffre d'affaires facturé des `months` derniers mois. */
  async revenueByMonth(companyId: number, months = 6) {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const invoices = await this.prisma.invoice.findMany({
      where: { companyId, ...ISSUED, date: { gte: from } },
      select: { date: true, baseTotalHT: true, type: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < months; i++) {
      const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
      buckets.set(monthKey(d), 0);
    }

    for (const invoice of invoices) {
      const key = monthKey(invoice.date);
      if (!buckets.has(key)) continue;
      const signed =
        invoice.type === InvoiceType.CREDIT_NOTE
          ? -invoice.baseTotalHT
          : invoice.baseTotalHT;
      buckets.set(key, (buckets.get(key) ?? 0) + signed);
    }

    return [...buckets.entries()].map(([month, total]) => ({
      month,
      total: round2(total),
    }));
  }

  /** Meilleurs clients par chiffre d'affaires facturé, avoirs déduits. */
  async topPartners(companyId: number, limit = 5) {
    const grouped = await this.prisma.invoice.groupBy({
      by: ['partnerId', 'type'],
      where: { companyId, ...ISSUED },
      _sum: { baseTotalHT: true },
      _count: { _all: true },
    });

    // Le tri se fait après déduction : un client très avoiré ne doit pas
    // rester en tête sur la seule foi de ses factures.
    const byPartner = new Map<number, { total: number; invoices: number }>();
    for (const row of grouped) {
      const current = byPartner.get(row.partnerId) ?? { total: 0, invoices: 0 };
      const amount = row._sum.baseTotalHT ?? 0;
      current.total += row.type === InvoiceType.CREDIT_NOTE ? -amount : amount;
      if (row.type === InvoiceType.INVOICE) current.invoices += row._count._all;
      byPartner.set(row.partnerId, current);
    }

    const top = [...byPartner.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, limit);

    if (top.length === 0) return [];

    const partners = await this.prisma.partner.findMany({
      where: { id: { in: top.map(([partnerId]) => partnerId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(
      partners.map((partner) => [partner.id, partner.name]),
    );

    return top.map(([partnerId, stats]) => ({
      partnerId,
      name: nameById.get(partnerId) ?? 'Client supprimé',
      invoices: stats.invoices,
      total: round2(stats.total),
    }));
  }

  /** Flux récent, tous documents confondus. */
  async recentActivity(companyId: number, limit = 8) {
    const [quotes, orders, invoices, leads, opportunities] = await Promise.all([
      this.prisma.quote.findMany({
        where: { companyId },
        include: { partner: { select: { name: true } } },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      }),
      this.prisma.order.findMany({
        where: { companyId },
        include: { partner: { select: { name: true } } },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      }),
      this.prisma.invoice.findMany({
        where: { companyId },
        include: { partner: { select: { name: true } } },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      }),
      this.prisma.lead.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.opportunity.findMany({
        where: { companyId },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      }),
    ]);

    // Champs bruts : la mise en forme et la traduction restent côté interface.
    const events = [
      ...quotes.map((q) => ({
        type: 'quote' as const,
        id: q.id,
        ref: q.ref,
        name: q.partner.name,
        stage: q.status as string | null,
        amount: q.totalHT,
        date: q.updatedAt,
      })),
      ...orders.map((o) => ({
        type: 'order' as const,
        id: o.id,
        ref: o.ref,
        name: o.partner.name,
        stage: o.status as string | null,
        amount: o.totalHT,
        date: o.updatedAt,
      })),
      ...invoices.map((i) => ({
        type: 'invoice' as const,
        id: i.id,
        ref: i.ref,
        name: i.partner.name,
        stage: i.status as string | null,
        amount: i.totalHT,
        date: i.updatedAt,
      })),
      ...leads.map((l) => ({
        type: 'lead' as const,
        id: l.id,
        ref: null as string | null,
        name: l.name,
        stage: l.status as string | null,
        amount: l.estimatedValue,
        date: l.createdAt,
      })),
      ...opportunities.map((o) => ({
        type: 'opportunity' as const,
        id: o.id,
        ref: null as string | null,
        name: o.name,
        stage: o.stage as string | null,
        amount: o.amount,
        date: o.updatedAt,
      })),
    ];

    return events
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  /** Chiffre d'affaires HT, avoirs déduits. */
  private async netRevenue(where: {
    companyId: number;
    status?: unknown;
    date?: unknown;
  }): Promise<number> {
    const grouped = await this.prisma.invoice.groupBy({
      by: ['type'],
      where: where as never,
      _sum: { baseTotalHT: true },
    });

    return round2(
      grouped.reduce((acc, row) => {
        const amount = row._sum.baseTotalHT ?? 0;
        return acc + (row.type === InvoiceType.CREDIT_NOTE ? -amount : amount);
      }, 0),
    );
  }

  /** Encours client TTC : reste dû sur les factures, moins les avoirs ouverts. */
  private async netOutstanding(companyId: number): Promise<number> {
    const grouped = await this.prisma.invoice.groupBy({
      by: ['type'],
      where: { companyId, status: { in: OPEN_INVOICE_STATUSES } },
      _sum: { baseTotalTTC: true, paidAmount: true },
    });

    return round2(
      grouped.reduce((acc, row) => {
        const due = (row._sum.baseTotalTTC ?? 0) - (row._sum.paidAmount ?? 0);
        return acc + (row.type === InvoiceType.CREDIT_NOTE ? -due : due);
      }, 0),
    );
  }

  /** Nombre de références sous leur seuil d'alerte. */
  private async countLowStock(companyId: number) {
    const products = await this.prisma.product.findMany({
      where: { companyId, manageStock: true, stockAlert: { gt: 0 } },
      select: { stockAlert: true, stocks: { select: { quantity: true } } },
    });

    return products.filter((product) => {
      const quantity = product.stocks.reduce((acc, s) => acc + s.quantity, 0);
      return quantity < product.stockAlert;
    }).length;
  }
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
