import { Injectable } from '@nestjs/common';
import {
  ActivityStatus,
  LeadStatus,
  OpportunityStage,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
      openLeads,
      openOpportunities,
      wonOpportunities,
      overdueActivities,
    ] = await Promise.all([
      this.prisma.partner.count({ where: { companyId, isActive: true } }),
      this.prisma.product.count({ where: { companyId } }),
      this.prisma.order.count({ where: { companyId } }),
      this.prisma.order.aggregate({ where: { companyId }, _sum: { total: true } }),
      this.prisma.order.aggregate({
        where: { companyId, createdAt: { gte: monthStart } },
        _sum: { total: true },
      }),
      this.prisma.invoice.count({ where: { order: { companyId } } }),
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
    ]);

    return {
      partners,
      products,
      orders,
      invoices,
      revenue: round2(revenue._sum.total ?? 0),
      monthRevenue: round2(monthRevenue._sum.total ?? 0),
      openLeads,
      openOpportunities: openOpportunities._count._all,
      openPipelineAmount: round2(openOpportunities._sum.amount ?? 0),
      wonOpportunities: wonOpportunities._count._all,
      wonAmount: round2(wonOpportunities._sum.amount ?? 0),
      overdueActivities,
    };
  }

  /** Chiffre d'affaires des `months` derniers mois, du plus ancien au plus récent. */
  async revenueByMonth(companyId: number, months = 6) {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const orders = await this.prisma.order.findMany({
      where: { companyId, createdAt: { gte: from } },
      select: { createdAt: true, total: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < months; i++) {
      const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
      buckets.set(monthKey(d), 0);
    }

    for (const order of orders) {
      const key = monthKey(order.createdAt);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + order.total);
      }
    }

    return [...buckets.entries()].map(([month, total]) => ({
      month,
      total: round2(total),
    }));
  }

  /** Meilleurs clients par chiffre d'affaires cumulé. */
  async topPartners(companyId: number, limit = 5) {
    const grouped = await this.prisma.order.groupBy({
      by: ['partnerId'],
      where: { companyId },
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    if (grouped.length === 0) return [];

    const partners = await this.prisma.partner.findMany({
      where: { id: { in: grouped.map((g) => g.partnerId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(partners.map((p) => [p.id, p.name]));

    return grouped.map((g) => ({
      partnerId: g.partnerId,
      name: nameById.get(g.partnerId) ?? 'Client supprimé',
      orders: g._count._all,
      total: round2(g._sum.total ?? 0),
    }));
  }

  /** Flux d'activité récent, toutes entités confondues. */
  async recentActivity(companyId: number, limit = 8) {
    const [orders, leads, opportunities] = await Promise.all([
      this.prisma.order.findMany({
        where: { companyId },
        include: { partner: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
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

    // On renvoie des champs bruts : la mise en forme (et la traduction des
    // étapes) est du ressort de l'interface.
    const events = [
      ...orders.map((o) => ({
        type: 'order' as const,
        id: o.id,
        name: o.partner.name,
        stage: null as string | null,
        amount: o.total,
        date: o.createdAt,
      })),
      ...leads.map((l) => ({
        type: 'lead' as const,
        id: l.id,
        name: l.name,
        stage: l.status as string | null,
        amount: l.estimatedValue,
        date: l.createdAt,
      })),
      ...opportunities.map((o) => ({
        type: 'opportunity' as const,
        id: o.id,
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
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
