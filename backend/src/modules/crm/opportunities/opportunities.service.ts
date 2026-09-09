import { Injectable, NotFoundException } from '@nestjs/common';
import { OpportunityStage, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { MoveStageDto } from './dto/move-stage.dto';

const OPPORTUNITY_INCLUDE = {
  partner: { select: { id: true, name: true, email: true } },
  owner: { select: { id: true, username: true, email: true } },
  lead: { select: { id: true, name: true } },
  _count: { select: { activities: true } },
} as const;

/** Probabilité par défaut appliquée à l'entrée dans une étape. */
const STAGE_PROBABILITY: Record<OpportunityStage, number> = {
  QUALIFICATION: 10,
  PROPOSAL: 40,
  NEGOTIATION: 70,
  WON: 100,
  LOST: 0,
};

const CLOSED_STAGES: OpportunityStage[] = [
  OpportunityStage.WON,
  OpportunityStage.LOST,
];

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, userId: number, data: CreateOpportunityDto) {
    await this.assertPartner(companyId, data.partnerId);
    await this.assertOwner(companyId, data.ownerId);

    const stage = data.stage ?? OpportunityStage.QUALIFICATION;

    return this.prisma.opportunity.create({
      data: {
        companyId,
        name: data.name,
        description: data.description,
        stage,
        amount: data.amount ?? 0,
        probability: data.probability ?? STAGE_PROBABILITY[stage],
        expectedCloseDate: data.expectedCloseDate
          ? new Date(data.expectedCloseDate)
          : null,
        closedAt: CLOSED_STAGES.includes(stage) ? new Date() : null,
        partnerId: data.partnerId,
        ownerId: data.ownerId ?? userId,
      },
      include: OPPORTUNITY_INCLUDE,
    });
  }

  findAll(
    companyId: number,
    filters: {
      stage?: OpportunityStage;
      search?: string;
      open?: boolean;
    } & PageParams,
  ) {
    const where: Prisma.OpportunityWhereInput = { companyId };

    if (filters.stage) where.stage = filters.stage;
    if (filters.open) where.stage = { notIn: CLOSED_STAGES };

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { partner: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.opportunity.findMany({
          where,
          include: OPPORTUNITY_INCLUDE,
          orderBy: [{ stage: 'asc' }, { updatedAt: 'desc' }],
          skip,
          take,
        }),
        this.prisma.opportunity.count({ where }),
      ]),
    );
  }

  /** Le pipeline, prêt à afficher : une colonne par étape. */
  async pipeline(companyId: number) {
    const opportunities = await this.prisma.opportunity.findMany({
      where: { companyId },
      include: OPPORTUNITY_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });

    return Object.values(OpportunityStage).map((stage) => {
      const items = opportunities.filter((o) => o.stage === stage);
      return {
        stage,
        count: items.length,
        amount: round2(items.reduce((acc, o) => acc + o.amount, 0)),
        weightedAmount: round2(
          items.reduce((acc, o) => acc + (o.amount * o.probability) / 100, 0),
        ),
        opportunities: items,
      };
    });
  }

  async findOne(companyId: number, id: number) {
    const opportunity = await this.prisma.opportunity.findFirst({
      where: { id, companyId },
      include: {
        ...OPPORTUNITY_INCLUDE,
        activities: {
          orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
          include: { owner: { select: { id: true, username: true } } },
        },
      },
    });
    if (!opportunity) throw new NotFoundException('Opportunité introuvable');
    return opportunity;
  }

  async update(companyId: number, id: number, data: UpdateOpportunityDto) {
    const current = await this.findOne(companyId, id);
    await this.assertPartner(companyId, data.partnerId);
    await this.assertOwner(companyId, data.ownerId);

    const nextStage = data.stage ?? current.stage;
    const stageChanged =
      data.stage !== undefined && data.stage !== current.stage;

    return this.prisma.opportunity.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        stage: data.stage,
        amount: data.amount,
        // Sur changement d'étape sans probabilité explicite, on applique le défaut.
        probability:
          data.probability ??
          (stageChanged ? STAGE_PROBABILITY[nextStage] : undefined),
        expectedCloseDate: data.expectedCloseDate
          ? new Date(data.expectedCloseDate)
          : undefined,
        partnerId: data.partnerId,
        ownerId: data.ownerId,
        lostReason:
          nextStage === OpportunityStage.LOST ? data.lostReason : null,
        closedAt: stageChanged
          ? CLOSED_STAGES.includes(nextStage)
            ? new Date()
            : null
          : undefined,
      },
      include: OPPORTUNITY_INCLUDE,
    });
  }

  /** Déplacement d'une carte dans le pipeline (drag & drop côté UI). */
  moveStage(companyId: number, id: number, data: MoveStageDto) {
    return this.update(companyId, id, {
      stage: data.stage,
      lostReason: data.lostReason,
    });
  }

  async remove(companyId: number, id: number) {
    await this.findOne(companyId, id);
    await this.prisma.opportunity.delete({ where: { id } });
    return { message: `Opportunité ${id} supprimée` };
  }

  // -------------------------------------------------------------------------

  private async assertPartner(companyId: number, partnerId?: number) {
    if (partnerId === undefined) return;
    const partner = await this.prisma.partner.findFirst({
      where: { id: partnerId, companyId },
      select: { id: true },
    });
    if (!partner) throw new NotFoundException('Client introuvable');
  }

  private async assertOwner(companyId: number, ownerId?: number) {
    if (ownerId === undefined) return;
    const member = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId: ownerId, companyId } },
      select: { id: true },
    });
    if (!member) {
      throw new NotFoundException(
        "Le responsable choisi n'appartient pas à cette société",
      );
    }
  }
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}
