import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

const EMPLOYEE_INCLUDE = {
  user: { select: { id: true, username: true, email: true } },
  _count: { select: { leaveRequests: true, expenseReports: true } },
} satisfies Prisma.EmployeeInclude;

export interface EmployeeFilters extends PageParams {
  search?: string;
  department?: string;
  isActive?: boolean;
}

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, dto: CreateEmployeeDto) {
    if (dto.userId) await this.assertFreeUser(companyId, dto.userId);

    return this.prisma.employee.create({
      data: {
        companyId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        position: dto.position,
        department: dto.department,
        userId: dto.userId,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        paidLeaveBalance: dto.paidLeaveBalance ?? 25,
      },
      include: EMPLOYEE_INCLUDE,
    });
  }

  findAll(companyId: number, filters: EmployeeFilters) {
    const where = this.buildWhere(companyId, filters);

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.employee.findMany({
          where,
          include: EMPLOYEE_INCLUDE,
          orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
          skip,
          take,
        }),
        this.prisma.employee.count({ where }),
      ]),
    );
  }

  /** Liste courte pour les listes déroulantes : pas de pagination. */
  async options(companyId: number) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId, isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return employees.map((employee) => ({
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
    }));
  }

  async findOne(companyId: number, id: number) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
      include: {
        ...EMPLOYEE_INCLUDE,
        leaveRequests: {
          orderBy: { startDate: 'desc' },
          take: 20,
          include: { decidedBy: { select: { id: true, username: true } } },
        },
        expenseReports: {
          orderBy: { period: 'desc' },
          take: 20,
        },
      },
    });

    if (!employee) throw new NotFoundException('Employé introuvable');
    return employee;
  }

  async update(companyId: number, id: number, dto: UpdateEmployeeDto) {
    await this.assertExists(companyId, id);
    if (dto.userId) await this.assertFreeUser(companyId, dto.userId, id);

    return this.prisma.employee.update({
      where: { id },
      data: {
        ...dto,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: EMPLOYEE_INCLUDE,
    });
  }

  /**
   * La suppression est refusée dès qu'un historique existe : congés et notes
   * de frais sont des pièces sociales, on désactive la fiche plutôt que de
   * l'effacer.
   */
  async remove(companyId: number, id: number) {
    const employee = await this.assertExists(companyId, id);

    const [leaves, reports] = await this.prisma.$transaction([
      this.prisma.leaveRequest.count({ where: { employeeId: id } }),
      this.prisma.expenseReport.count({ where: { employeeId: id } }),
    ]);

    if (leaves > 0 || reports > 0) {
      throw new BadRequestException(
        `Cet employé porte ${leaves} demande(s) de congés et ${reports} note(s) de frais : désactivez sa fiche plutôt que de la supprimer.`,
      );
    }

    await this.prisma.employee.delete({ where: { id } });
    return {
      message: `Employé ${employee.firstName} ${employee.lastName} supprimé`,
    };
  }

  /** Fiche de l'employé rattaché au compte connecté, s'il en existe une. */
  findByUser(companyId: number, userId: number) {
    return this.prisma.employee.findFirst({
      where: { companyId, userId },
      include: EMPLOYEE_INCLUDE,
    });
  }

  // --- Contrôles ------------------------------------------------------------

  private buildWhere(
    companyId: number,
    filters: EmployeeFilters,
  ): Prisma.EmployeeWhereInput {
    const where: Prisma.EmployeeWhereInput = { companyId };

    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.department) where.department = filters.department;

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { position: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async assertExists(companyId: number, id: number) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!employee) throw new NotFoundException('Employé introuvable');
    return employee;
  }

  /**
   * Un compte applicatif ne peut tenir qu'une fiche employé par société, et
   * seulement s'il en est membre : la contrainte d'unicité de la base le
   * garantit, autant renvoyer une erreur lisible avant d'y arriver.
   *
   * La recherche est bornée à la société : une fiche portée par le même
   * compte dans une autre société ne regarde pas celle-ci, et le dire
   * reviendrait à divulguer son existence.
   */
  private async assertFreeUser(
    companyId: number,
    userId: number,
    selfId?: number,
  ) {
    const member = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
      select: { id: true },
    });
    if (!member) {
      throw new NotFoundException(
        "Le compte choisi n'appartient pas à cette société",
      );
    }

    const taken = await this.prisma.employee.findFirst({
      where: { companyId, userId },
      select: { id: true },
    });
    if (taken && taken.id !== selfId) {
      throw new BadRequestException(
        'Ce compte est déjà rattaché à une autre fiche employé',
      );
    }
  }
}
