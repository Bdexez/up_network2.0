import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { assertTransition } from 'src/common/documents/workflow';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { PROJECT_STATUS_LABEL, PROJECT_TRANSITIONS } from './project-status';
import { computeProjectMetrics } from './project-metrics';
import {
  CreateProjectDto,
  CreateTaskDto,
  CreateTimeEntryDto,
  UpdateProjectDto,
  UpdateTaskDto,
} from './dto/project.dto';

const PROJECT_INCLUDE = {
  partner: { select: { id: true, name: true } },
  owner: { select: { id: true, username: true } },
  _count: { select: { tasks: true, timeEntries: true } },
} satisfies Prisma.ProjectInclude;

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // --- Projets --------------------------------------------------------------

  async create(companyId: number, userId: number, dto: CreateProjectDto) {
    await this.assertReferences(companyId, dto);

    return this.prisma.$transaction(async (tx) => {
      // Référence lisible et séquentielle par société : PR-0001, PR-0002…
      const count = await tx.project.count({ where: { companyId } });
      const ref = `PR-${String(count + 1).padStart(4, '0')}`;

      return tx.project.create({
        data: {
          ref,
          companyId,
          name: dto.name,
          description: dto.description,
          partnerId: dto.partnerId,
          ownerId: dto.ownerId ?? userId,
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          budgetHours: dto.budgetHours ?? 0,
          hourlyRate: dto.hourlyRate ?? 0,
        },
        include: PROJECT_INCLUDE,
      });
    });
  }

  findAll(
    companyId: number,
    filters: { status?: ProjectStatus; partnerId?: number } & PageParams,
  ) {
    const where: Prisma.ProjectWhereInput = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.partnerId) where.partnerId = filters.partnerId;

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.project.findMany({
          where,
          include: PROJECT_INCLUDE,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.project.count({ where }),
      ]),
    );
  }

  /** Fiche projet : tâches, temps saisis et avancement calculé. */
  async findOne(companyId: number, id: number) {
    const project = await this.prisma.project.findFirst({
      where: { id, companyId },
      include: {
        ...PROJECT_INCLUDE,
        tasks: {
          orderBy: [{ status: 'asc' }, { position: 'asc' }, { dueDate: 'asc' }],
          include: {
            assignee: { select: { id: true, username: true } },
            _count: { select: { timeEntries: true } },
          },
        },
        timeEntries: {
          orderBy: { date: 'desc' },
          take: 50,
          include: {
            user: { select: { id: true, username: true } },
            task: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!project) throw new NotFoundException('Projet introuvable');

    // Les métriques portent sur tous les temps, pas seulement les 50 derniers.
    const allEntries = await this.prisma.timeEntry.findMany({
      where: { projectId: id },
      select: { hours: true, billable: true, invoicedHours: true },
    });

    return {
      ...project,
      metrics: computeProjectMetrics(allEntries, {
        budgetHours: project.budgetHours,
        hourlyRate: project.hourlyRate,
      }),
    };
  }

  async update(companyId: number, id: number, dto: UpdateProjectDto) {
    await this.assertExists(companyId, id);
    await this.assertReferences(companyId, dto);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async changeStatus(companyId: number, id: number, status: ProjectStatus) {
    const project = await this.assertExists(companyId, id);
    assertTransition(
      project.status,
      status,
      PROJECT_TRANSITIONS,
      PROJECT_STATUS_LABEL,
    );

    return this.prisma.project.update({
      where: { id },
      data: { status },
      include: PROJECT_INCLUDE,
    });
  }

  async remove(companyId: number, id: number) {
    const project = await this.assertExists(companyId, id);

    const entries = await this.prisma.timeEntry.count({
      where: { projectId: id },
    });
    if (entries > 0) {
      throw new BadRequestException(
        `Ce projet porte ${entries} saisie(s) de temps : clôturez-le plutôt que de le supprimer.`,
      );
    }

    await this.prisma.project.delete({ where: { id } });
    return { message: `Projet ${project.ref} supprimé` };
  }

  // --- Tâches ---------------------------------------------------------------

  async createTask(companyId: number, projectId: number, dto: CreateTaskDto) {
    await this.assertExists(companyId, projectId);
    if (dto.assigneeId) await this.assertMember(companyId, dto.assigneeId);

    const position = await this.prisma.task.count({ where: { projectId } });

    return this.prisma.task.create({
      data: {
        projectId,
        position,
        name: dto.name,
        description: dto.description,
        status: dto.status,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        estimatedHours: dto.estimatedHours ?? 0,
      },
      include: { assignee: { select: { id: true, username: true } } },
    });
  }

  async updateTask(
    companyId: number,
    projectId: number,
    taskId: number,
    dto: UpdateTaskDto,
  ) {
    await this.assertTask(companyId, projectId, taskId);
    if (dto.assigneeId) await this.assertMember(companyId, dto.assigneeId);

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { assignee: { select: { id: true, username: true } } },
    });
  }

  async removeTask(companyId: number, projectId: number, taskId: number) {
    await this.assertTask(companyId, projectId, taskId);
    await this.prisma.task.delete({ where: { id: taskId } });
    return { message: 'Tâche supprimée' };
  }

  // --- Temps passé ----------------------------------------------------------

  async logTime(
    companyId: number,
    userId: number,
    projectId: number,
    dto: CreateTimeEntryDto,
  ) {
    const project = await this.assertExists(companyId, projectId);

    if (project.status === ProjectStatus.CLOSED) {
      throw new BadRequestException(
        'Projet clôturé : rouvrez-le pour y saisir du temps',
      );
    }

    if (dto.taskId) await this.assertTask(companyId, projectId, dto.taskId);

    return this.prisma.timeEntry.create({
      data: {
        projectId,
        userId,
        taskId: dto.taskId,
        hours: dto.hours,
        date: dto.date ? new Date(dto.date) : new Date(),
        description: dto.description,
        billable: dto.billable ?? true,
      },
      include: {
        user: { select: { id: true, username: true } },
        task: { select: { id: true, name: true } },
      },
    });
  }

  async removeTime(companyId: number, projectId: number, entryId: number) {
    await this.assertExists(companyId, projectId);

    const entry = await this.prisma.timeEntry.findFirst({
      where: { id: entryId, projectId },
    });
    if (!entry) throw new NotFoundException('Saisie de temps introuvable');

    if (entry.invoicedHours > 0) {
      throw new BadRequestException(
        'Ce temps a déjà été facturé : il ne peut plus être supprimé.',
      );
    }

    await this.prisma.timeEntry.delete({ where: { id: entryId } });
    return { message: 'Saisie supprimée' };
  }

  // --- Contrôles ------------------------------------------------------------

  private async assertExists(companyId: number, id: number) {
    const project = await this.prisma.project.findFirst({
      where: { id, companyId },
      select: { id: true, ref: true, status: true },
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    return project;
  }

  private async assertTask(
    companyId: number,
    projectId: number,
    taskId: number,
  ) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId, project: { companyId } },
      select: { id: true },
    });
    if (!task) throw new NotFoundException('Tâche introuvable');
  }

  private async assertMember(companyId: number, userId: number) {
    const member = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
      select: { id: true },
    });
    if (!member) {
      throw new NotFoundException(
        "L'utilisateur choisi n'appartient pas à cette société",
      );
    }
  }

  private async assertReferences(
    companyId: number,
    dto: { partnerId?: number; ownerId?: number },
  ) {
    if (dto.partnerId !== undefined) {
      const partner = await this.prisma.partner.findFirst({
        where: { id: dto.partnerId, companyId },
        select: { id: true },
      });
      if (!partner) throw new NotFoundException('Client introuvable');
    }

    if (dto.ownerId !== undefined)
      await this.assertMember(companyId, dto.ownerId);
  }
}
