import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveStatus, LeaveType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { assertTransition } from 'src/common/documents/workflow';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { round2 } from 'src/common/documents/totals';
import { countWorkingDays } from './leave-days';
import { LEAVE_STATUS_LABEL, LEAVE_TRANSITIONS } from './hr-status';
import { CreateLeaveRequestDto, DecideLeaveDto } from './dto/leave.dto';

const LEAVE_INCLUDE = {
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      paidLeaveBalance: true,
    },
  },
  decidedBy: { select: { id: true, username: true } },
} satisfies Prisma.LeaveRequestInclude;

/** Statuts qui immobilisent des jours dans le planning. */
const ACTIVE_STATUSES = [LeaveStatus.PENDING, LeaveStatus.APPROVED];

export interface LeaveFilters extends PageParams {
  employeeId?: number;
  status?: LeaveStatus;
  type?: LeaveType;
  from?: string;
  to?: string;
}

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, userId: number, dto: CreateLeaveRequestDto) {
    const employeeId = await this.resolveEmployee(
      companyId,
      userId,
      dto.employeeId,
    );

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException(
        'Le dernier jour de congés précède le premier',
      );
    }

    const days = countWorkingDays(startDate, endDate);
    if (days === 0) {
      throw new BadRequestException(
        'La période ne contient aucun jour ouvré (week-ends et jours fériés exclus)',
      );
    }

    await this.assertNoOverlap(employeeId, startDate, endDate);

    return this.prisma.leaveRequest.create({
      data: {
        employeeId,
        type: dto.type ?? LeaveType.PAID,
        startDate,
        endDate,
        days,
        reason: dto.reason,
      },
      include: LEAVE_INCLUDE,
    });
  }

  findAll(companyId: number, filters: LeaveFilters) {
    const where: Prisma.LeaveRequestWhereInput = {
      employee: { companyId },
    };

    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    // Chevauchement, et non inclusion : une absence à cheval sur deux mois
    // doit apparaître dans les deux plannings.
    if (filters.to) where.startDate = { lte: new Date(filters.to) };
    if (filters.from) where.endDate = { gte: new Date(filters.from) };

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.leaveRequest.findMany({
          where,
          include: LEAVE_INCLUDE,
          orderBy: { startDate: 'desc' },
          skip,
          take,
        }),
        this.prisma.leaveRequest.count({ where }),
      ]),
    );
  }

  async findOne(companyId: number, id: number) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id, employee: { companyId } },
      include: LEAVE_INCLUDE,
    });
    if (!request) throw new NotFoundException('Demande de congés introuvable');
    return request;
  }

  /**
   * Décision d'un responsable.
   *
   * Le solde de congés payés suit la décision : il est débité à l'approbation
   * et rendu si la demande est annulée ensuite. Les autres types d'absence
   * (RTT, maladie, sans solde) ne sont pas adossés à ce compteur.
   */
  async decide(
    companyId: number,
    userId: number,
    id: number,
    dto: DecideLeaveDto,
  ) {
    const request = await this.findOne(companyId, id);

    // Rejouer la même décision ne doit rien faire : `assertTransition` laisse
    // passer un statut identique, et le solde serait débité une seconde fois.
    if (request.status === dto.status) return request;

    assertTransition(
      request.status,
      dto.status,
      LEAVE_TRANSITIONS,
      LEAVE_STATUS_LABEL,
    );

    const debits = request.type === LeaveType.PAID;
    const wasApproved = request.status === LeaveStatus.APPROVED;
    const nowApproved = dto.status === LeaveStatus.APPROVED;

    if (
      debits &&
      nowApproved &&
      request.days > request.employee.paidLeaveBalance
    ) {
      throw new BadRequestException(
        `Solde insuffisant : ${request.employee.paidLeaveBalance} jour(s) disponibles pour ${request.days} demandé(s).`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (debits && nowApproved) {
        await tx.employee.update({
          where: { id: request.employeeId },
          data: { paidLeaveBalance: { decrement: request.days } },
        });
      } else if (debits && wasApproved) {
        await tx.employee.update({
          where: { id: request.employeeId },
          data: { paidLeaveBalance: { increment: request.days } },
        });
      }

      return tx.leaveRequest.update({
        where: { id },
        data: {
          status: dto.status,
          decisionNote: dto.decisionNote,
          decidedById: userId,
          decidedAt: new Date(),
        },
        include: LEAVE_INCLUDE,
      });
    });
  }

  async remove(companyId: number, id: number) {
    const request = await this.findOne(companyId, id);

    if (request.status === LeaveStatus.APPROVED) {
      throw new BadRequestException(
        'Cette demande est approuvée : annulez-la pour rendre les jours avant de la supprimer.',
      );
    }

    await this.prisma.leaveRequest.delete({ where: { id } });
    return { message: 'Demande supprimée' };
  }

  /** Compteurs affichés en tête de l'écran des congés. */
  async summary(companyId: number) {
    const [pending, employees, upcoming] = await this.prisma.$transaction([
      this.prisma.leaveRequest.count({
        where: { employee: { companyId }, status: LeaveStatus.PENDING },
      }),
      this.prisma.employee.aggregate({
        where: { companyId, isActive: true },
        _sum: { paidLeaveBalance: true },
        _count: true,
      }),
      this.prisma.leaveRequest.count({
        where: {
          employee: { companyId },
          status: LeaveStatus.APPROVED,
          endDate: { gte: new Date() },
        },
      }),
    ]);

    return {
      pending,
      upcoming,
      activeEmployees: employees._count,
      totalPaidLeaveBalance: round2(employees._sum.paidLeaveBalance ?? 0),
    };
  }

  // --- Contrôles ------------------------------------------------------------

  /**
   * Sans `employeeId`, la demande est déposée pour le compte connecté : c'est
   * le cas courant, un salarié pose ses propres congés.
   */
  private async resolveEmployee(
    companyId: number,
    userId: number,
    employeeId?: number,
  ) {
    if (employeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: { id: employeeId, companyId },
        select: { id: true, isActive: true },
      });
      if (!employee) throw new NotFoundException('Employé introuvable');
      if (!employee.isActive) {
        throw new BadRequestException(
          "Cet employé n'est plus en poste : sa fiche doit être réactivée.",
        );
      }
      return employee.id;
    }

    const own = await this.prisma.employee.findFirst({
      where: { companyId, userId, isActive: true },
      select: { id: true },
    });
    if (!own) {
      throw new BadRequestException(
        "Aucune fiche employé n'est rattachée à votre compte : précisez l'employé concerné.",
      );
    }
    return own.id;
  }

  private async assertNoOverlap(employeeId: number, start: Date, end: Date) {
    const overlap = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ACTIVE_STATUSES },
        startDate: { lte: end },
        endDate: { gte: start },
      },
      select: { id: true, startDate: true, endDate: true },
    });

    if (overlap) {
      throw new BadRequestException(
        `Une demande couvre déjà du ${overlap.startDate.toLocaleDateString('fr-FR')} au ${overlap.endDate.toLocaleDateString('fr-FR')}.`,
      );
    }
  }
}
