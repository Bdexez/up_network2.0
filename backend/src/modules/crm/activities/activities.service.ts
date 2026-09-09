import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityStatus, ActivityType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

const ACTIVITY_INCLUDE = {
  owner: { select: { id: true, username: true, email: true } },
  lead: { select: { id: true, name: true } },
  opportunity: { select: { id: true, name: true } },
  partner: { select: { id: true, name: true } },
} as const;

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, userId: number, data: CreateActivityDto) {
    if (!data.leadId && !data.opportunityId && !data.partnerId) {
      throw new BadRequestException(
        'Une activité doit être rattachée à une piste, une opportunité ou un client',
      );
    }

    await this.assertLinks(companyId, data);

    const status = data.status ?? ActivityStatus.PLANNED;

    return this.prisma.activity.create({
      data: {
        companyId,
        subject: data.subject,
        description: data.description,
        type: data.type ?? ActivityType.TASK,
        status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        completedAt: status === ActivityStatus.DONE ? new Date() : null,
        ownerId: data.ownerId ?? userId,
        leadId: data.leadId,
        opportunityId: data.opportunityId,
        partnerId: data.partnerId,
      },
      include: ACTIVITY_INCLUDE,
    });
  }

  findAll(
    companyId: number,
    filters: {
      status?: ActivityStatus;
      type?: ActivityType;
      leadId?: number;
      opportunityId?: number;
      partnerId?: number;
      upcoming?: boolean;
    } & PageParams,
  ) {
    const where: Prisma.ActivityWhereInput = { companyId };

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.leadId) where.leadId = filters.leadId;
    if (filters.opportunityId) where.opportunityId = filters.opportunityId;
    if (filters.partnerId) where.partnerId = filters.partnerId;

    if (filters.upcoming) {
      where.status = ActivityStatus.PLANNED;
      where.dueDate = { not: null };
    }

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.activity.findMany({
          where,
          include: ACTIVITY_INCLUDE,
          orderBy: [
            { status: 'asc' },
            { dueDate: 'asc' },
            { createdAt: 'desc' },
          ],
          skip,
          take,
        }),
        this.prisma.activity.count({ where }),
      ]),
    );
  }

  async findOne(companyId: number, id: number) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, companyId },
      include: ACTIVITY_INCLUDE,
    });
    if (!activity) throw new NotFoundException('Activité introuvable');
    return activity;
  }

  async update(companyId: number, id: number, data: UpdateActivityDto) {
    await this.findOne(companyId, id);
    await this.assertLinks(companyId, data);

    return this.prisma.activity.update({
      where: { id },
      data: {
        subject: data.subject,
        description: data.description,
        type: data.type,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completedAt:
          data.status === undefined
            ? undefined
            : data.status === ActivityStatus.DONE
              ? new Date()
              : null,
        ownerId: data.ownerId,
        leadId: data.leadId,
        opportunityId: data.opportunityId,
        partnerId: data.partnerId,
      },
      include: ACTIVITY_INCLUDE,
    });
  }

  /** Bascule terminé / à faire depuis la liste. */
  async toggleDone(companyId: number, id: number) {
    const activity = await this.findOne(companyId, id);
    const done = activity.status === ActivityStatus.DONE;

    return this.prisma.activity.update({
      where: { id },
      data: {
        status: done ? ActivityStatus.PLANNED : ActivityStatus.DONE,
        completedAt: done ? null : new Date(),
      },
      include: ACTIVITY_INCLUDE,
    });
  }

  async remove(companyId: number, id: number) {
    await this.findOne(companyId, id);
    await this.prisma.activity.delete({ where: { id } });
    return { message: `Activité ${id} supprimée` };
  }

  // -------------------------------------------------------------------------

  /** Toute cible référencée doit appartenir à la société active. */
  private async assertLinks(
    companyId: number,
    data: Pick<
      CreateActivityDto,
      'leadId' | 'opportunityId' | 'partnerId' | 'ownerId'
    >,
  ) {
    if (data.leadId !== undefined) {
      const lead = await this.prisma.lead.findFirst({
        where: { id: data.leadId, companyId },
        select: { id: true },
      });
      if (!lead) throw new NotFoundException('Piste introuvable');
    }

    if (data.opportunityId !== undefined) {
      const opportunity = await this.prisma.opportunity.findFirst({
        where: { id: data.opportunityId, companyId },
        select: { id: true },
      });
      if (!opportunity) throw new NotFoundException('Opportunité introuvable');
    }

    if (data.partnerId !== undefined) {
      const partner = await this.prisma.partner.findFirst({
        where: { id: data.partnerId, companyId },
        select: { id: true },
      });
      if (!partner) throw new NotFoundException('Client introuvable');
    }

    if (data.ownerId !== undefined) {
      const member = await this.prisma.userCompany.findUnique({
        where: { userId_companyId: { userId: data.ownerId, companyId } },
        select: { id: true },
      });
      if (!member) {
        throw new NotFoundException(
          "Le responsable choisi n'appartient pas à cette société",
        );
      }
    }
  }
}
