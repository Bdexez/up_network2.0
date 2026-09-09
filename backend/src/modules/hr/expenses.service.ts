import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExpenseStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  assertEditable,
  assertTransition,
} from 'src/common/documents/workflow';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { computeExpenseLine, sumExpenseLines } from './expense-totals';
import {
  EXPENSE_DECISIONS,
  EXPENSE_EDITABLE,
  EXPENSE_STATUS_LABEL,
  EXPENSE_TRANSITIONS,
} from './hr-status';
import {
  CreateExpenseReportDto,
  ExpenseLineDto,
  UpdateExpenseReportDto,
} from './dto/expense.dto';

const REPORT_INCLUDE = {
  employee: { select: { id: true, firstName: true, lastName: true } },
  decidedBy: { select: { id: true, username: true } },
  lines: { orderBy: { date: 'asc' } },
} satisfies Prisma.ExpenseReportInclude;

export interface ExpenseFilters extends PageParams {
  employeeId?: number;
  status?: ExpenseStatus;
  from?: string;
  to?: string;
}

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, userId: number, dto: CreateExpenseReportDto) {
    const employeeId = await this.resolveEmployee(
      companyId,
      userId,
      dto.employeeId,
    );
    const period = firstOfMonth(new Date(dto.period));
    const lines = (dto.lines ?? []).map(toLineData);
    const totals = sumExpenseLines(lines);

    return this.prisma.$transaction(async (tx) => {
      const ref = await this.nextRef(tx, companyId, period);

      return tx.expenseReport.create({
        data: {
          companyId,
          employeeId,
          ref,
          period,
          notes: dto.notes,
          ...totals,
          lines: { create: lines },
        },
        include: REPORT_INCLUDE,
      });
    });
  }

  findAll(companyId: number, filters: ExpenseFilters) {
    const where: Prisma.ExpenseReportWhereInput = { companyId };

    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    if (filters.from || filters.to) {
      where.period = {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to ? { lte: new Date(filters.to) } : {}),
      };
    }

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.expenseReport.findMany({
          where,
          include: REPORT_INCLUDE,
          orderBy: [{ period: 'desc' }, { ref: 'desc' }],
          skip,
          take,
        }),
        this.prisma.expenseReport.count({ where }),
      ]),
    );
  }

  async findOne(companyId: number, id: number) {
    const report = await this.prisma.expenseReport.findFirst({
      where: { id, companyId },
      include: REPORT_INCLUDE,
    });
    if (!report) throw new NotFoundException('Note de frais introuvable');
    return report;
  }

  /** Les lignes fournies remplacent l'intégralité des lignes existantes. */
  async update(companyId: number, id: number, dto: UpdateExpenseReportDto) {
    const report = await this.findOne(companyId, id);
    assertEditable(report.status, EXPENSE_EDITABLE, EXPENSE_STATUS_LABEL);

    const data: Prisma.ExpenseReportUpdateInput = {
      notes: dto.notes,
      period: dto.period ? firstOfMonth(new Date(dto.period)) : undefined,
    };

    if (dto.lines) {
      const lines = dto.lines.map(toLineData);
      Object.assign(data, sumExpenseLines(lines), {
        lines: { deleteMany: {}, create: lines },
      });
    }

    return this.prisma.expenseReport.update({
      where: { id },
      data,
      include: REPORT_INCLUDE,
    });
  }

  async changeStatus(
    companyId: number,
    userId: number,
    id: number,
    status: ExpenseStatus,
  ) {
    const report = await this.findOne(companyId, id);

    // Rejouer le même statut ne doit pas réécrire la décision déjà prise.
    if (report.status === status) return report;

    assertTransition(
      report.status,
      status,
      EXPENSE_TRANSITIONS,
      EXPENSE_STATUS_LABEL,
    );

    if (status === ExpenseStatus.SUBMITTED && report.lines.length === 0) {
      throw new BadRequestException(
        'Une note de frais vide ne peut pas être soumise',
      );
    }

    const decided = EXPENSE_DECISIONS.includes(status);

    return this.prisma.expenseReport.update({
      where: { id },
      data: {
        status,
        // Repasser en brouillon efface la décision précédente : la note
        // repart pour un tour de validation.
        decidedById: decided ? userId : null,
        decidedAt: decided ? new Date() : null,
      },
      include: REPORT_INCLUDE,
    });
  }

  async remove(companyId: number, id: number) {
    const report = await this.findOne(companyId, id);

    if (report.status === ExpenseStatus.REIMBURSED) {
      throw new BadRequestException(
        'Cette note a été remboursée : elle est conservée comme pièce justificative.',
      );
    }

    await this.prisma.expenseReport.delete({ where: { id } });
    return { message: `Note de frais ${report.ref} supprimée` };
  }

  // --- Contrôles ------------------------------------------------------------

  private async resolveEmployee(
    companyId: number,
    userId: number,
    employeeId?: number,
  ) {
    if (employeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: { id: employeeId, companyId },
        select: { id: true },
      });
      if (!employee) throw new NotFoundException('Employé introuvable');
      return employee.id;
    }

    const own = await this.prisma.employee.findFirst({
      where: { companyId, userId },
      select: { id: true },
    });
    if (!own) {
      throw new BadRequestException(
        "Aucune fiche employé n'est rattachée à votre compte : précisez l'employé concerné.",
      );
    }
    return own.id;
  }

  /**
   * Référence lisible et annuelle : NF2026-0001, NF2026-0042…
   *
   * Les notes de frais ne passent pas par `NumberingService` : son compteur
   * est indexé sur `DocumentType`, qui ne décrit que les pièces de vente et
   * d'achat. La séquence est donc déduite de la dernière référence de
   * l'année ; l'unicité `(companyId, ref)` reste le garde-fou en base.
   */
  private async nextRef(
    tx: Prisma.TransactionClient,
    companyId: number,
    at: Date,
  ) {
    const prefix = `NF${at.getUTCFullYear()}-`;

    const last = await tx.expenseReport.findFirst({
      where: { companyId, ref: { startsWith: prefix } },
      orderBy: { ref: 'desc' },
      select: { ref: true },
    });

    const previous = last ? Number(last.ref.slice(prefix.length)) : 0;
    const value = Number.isFinite(previous) ? previous + 1 : 1;

    return `${prefix}${String(value).padStart(4, '0')}`;
  }
}

/** Le mois concerné, ramené à son premier jour (en UTC). */
function firstOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function toLineData(line: ExpenseLineDto) {
  return {
    category: line.category,
    date: new Date(line.date),
    description: line.description,
    vatRate: line.vatRate ?? 20,
    ...computeExpenseLine({
      amountHT: line.amountHT,
      vatRate: line.vatRate ?? 20,
    }),
  };
}
