import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeadStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';

const LEAD_INCLUDE = {
  owner: { select: { id: true, username: true, email: true } },
  convertedPartner: { select: { id: true, name: true } },
  _count: { select: { activities: true, opportunities: true } },
} as const;

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, ownerId: number, data: CreateLeadDto) {
    await this.assertOwner(companyId, data.ownerId);

    return this.prisma.lead.create({
      data: {
        ...data,
        companyId,
        ownerId: data.ownerId ?? ownerId,
      },
      include: LEAD_INCLUDE,
    });
  }

  findAll(
    companyId: number,
    filters: { status?: LeadStatus; search?: string } & PageParams,
  ) {
    const where: Prisma.LeadWhereInput = { companyId };

    if (filters.status) where.status = filters.status;

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { contactName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.lead.findMany({
          where,
          include: LEAD_INCLUDE,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.lead.count({ where }),
      ]),
    );
  }

  async findOne(companyId: number, id: number) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: {
        ...LEAD_INCLUDE,
        activities: {
          orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
          include: { owner: { select: { id: true, username: true } } },
        },
        opportunities: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!lead) throw new NotFoundException('Piste introuvable');
    return lead;
  }

  async update(companyId: number, id: number, data: UpdateLeadDto) {
    await this.assertExists(companyId, id);
    await this.assertOwner(companyId, data.ownerId);
    return this.prisma.lead.update({
      where: { id },
      data,
      include: LEAD_INCLUDE,
    });
  }

  async remove(companyId: number, id: number) {
    await this.assertExists(companyId, id);
    await this.prisma.lead.delete({ where: { id } });
    return { message: `Piste ${id} supprimée` };
  }

  /**
   * Convertit une piste en client, et optionnellement en opportunité.
   * L'ensemble est transactionnel : pas de client créé sans piste marquée.
   */
  async convert(
    companyId: number,
    userId: number,
    id: number,
    data: ConvertLeadDto,
  ) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
    });
    if (!lead) throw new NotFoundException('Piste introuvable');

    if (lead.status === LeadStatus.CONVERTED) {
      throw new ConflictException('Cette piste a déjà été convertie');
    }

    if (data.partnerId) {
      const partner = await this.prisma.partner.findFirst({
        where: { id: data.partnerId, companyId },
        select: { id: true },
      });
      if (!partner) throw new NotFoundException('Client introuvable');
    }

    return this.prisma.$transaction(async (tx) => {
      const partner = data.partnerId
        ? await tx.partner.findUniqueOrThrow({ where: { id: data.partnerId } })
        : await tx.partner.create({
            data: {
              companyId,
              name: lead.companyName?.trim() || lead.name,
              email: lead.email,
              phone: lead.phone,
            },
          });

      const opportunity =
        data.createOpportunity === false
          ? null
          : await tx.opportunity.create({
              data: {
                companyId,
                name: data.opportunityName?.trim() || lead.name,
                amount: data.amount ?? lead.estimatedValue,
                partnerId: partner.id,
                leadId: lead.id,
                ownerId: lead.ownerId ?? userId,
                description: lead.description,
              },
            });

      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          status: LeadStatus.CONVERTED,
          convertedPartnerId: partner.id,
          convertedAt: new Date(),
        },
        include: LEAD_INCLUDE,
      });

      // Les activités de la piste suivent l'opportunité créée.
      if (opportunity) {
        await tx.activity.updateMany({
          where: { leadId: id, opportunityId: null },
          data: { opportunityId: opportunity.id, partnerId: partner.id },
        });
      }

      return { lead: updatedLead, partner, opportunity };
    });
  }

  /** Répartition des pistes par statut, pour le tableau de bord. */
  async statsByStatus(companyId: number) {
    const grouped = await this.prisma.lead.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { _all: true },
      _sum: { estimatedValue: true },
    });

    return Object.values(LeadStatus).map((status) => {
      const row = grouped.find((g) => g.status === status);
      return {
        status,
        count: row?._count._all ?? 0,
        estimatedValue: row?._sum.estimatedValue ?? 0,
      };
    });
  }

  // -------------------------------------------------------------------------

  private async assertExists(companyId: number, id: number) {
    const found = await this.prisma.lead.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Piste introuvable');
  }

  /** Un responsable doit être membre de la même société. */
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
