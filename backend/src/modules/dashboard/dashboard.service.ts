import { Injectable } from '@nestjs/common';
import {
  ActivityStatus,
  InvoiceStatus,
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
      this.prisma.invoice.aggregate({
        where: { companyId, status: { not: InvoiceStatus.DRAFT } },
        _sum: { totalHT: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          companyId,
          status: { not: InvoiceStatus.DRAFT },
          date: { gte: monthStart },
        },
        _sum: { totalHT: true },
      }),
      this.prisma.invoice.count({ where: { companyId } }),
      this.prisma.invoice.aggregate({
        where: { companyId, status: { in: OPEN_INVOICE_STATUSES } },
        _sum: { totalTTC: true, paidAmount: true },
      }),
      this.prisma.invoice.count({
        where: {
          companyId,
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
        _sum: { totalHT: true },
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
        where: { companyId, status: ActivityStatus.PLANNED, dueDate: { lt: now } },
      }),
      this.countLowStock(companyId),
    ]);

    return {
      partners,
      products,
      orders,
      invoices,
      revenue: round2(revenue._sum.totalHT ?? 0),
      monthRevenue: round2(monthRevenue._sum.totalHT ?? 0),
      outstandingAmount: round2(
        (outstanding._sum.totalTTC ?? 0) - (outstanding._sum.paidAmount ?? 0),
      ),
      overdueInvoices,
      openQuotes: openQuotes._count._all,
      openQuotesAmount: round2(openQuotes._sum.totalHT ?? 0),
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
      where: {
        companyId,
        status: { not: InvoiceStatus.DRAFT },
        date: { gte: from },
      },
      select: { date: true, totalHT: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < months; i++) {
      const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
      buckets.set(monthKey(d), 0);
    }

    for (const invoice of invoices) {
      const key = monthKey(invoice.date);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + invoice.totalHT);
      }
    }

    return [...buckets.entries()].map(([month, total]) => ({
      month,
      total: round2(total),
    }));
  }

  /** Meilleurs clients par chiffre d'affaires facturé. */
  async topPartners(companyId: number, limit = 5) {
    const grouped = await this.prisma.invoice.groupBy({
      by: ['partnerId'],
      where: { companyId, status: { not: InvoiceStatus.DRAFT } },
      _sum: { totalHT: true },
      _count: { _all: true },
      orderBy: { _sum: { totalHT: 'desc' } },
      take: limit,
    });

    if (grouped.length === 0) return [];

    const partners = await this.prisma.partner.findMany({
      where: { id: { in: grouped.map((row) => row.partnerId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(partners.map((partner) => [partner.id, partner.name]));

    return grouped.map((row) => ({
      partnerId: row.partnerId,
      name: nameById.get(row.partnerId) ?? 'Client supprimé',
      invoices: row._count._all,
      total: round2(row._sum.totalHT ?? 0),
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
