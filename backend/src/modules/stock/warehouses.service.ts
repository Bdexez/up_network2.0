import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { round2 } from 'src/common/documents/totals';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, dto: CreateWarehouseDto) {
    await this.assertCodeFree(companyId, dto.code);

    return this.prisma.$transaction(async (tx) => {
      // Un seul entrepôt par défaut à la fois.
      if (dto.isDefault) {
        await tx.warehouse.updateMany({
          where: { companyId },
          data: { isDefault: false },
        });
      }

      const isFirst =
        (await tx.warehouse.count({ where: { companyId } })) === 0;

      return tx.warehouse.create({
        data: { ...dto, companyId, isDefault: dto.isDefault ?? isFirst },
      });
    });
  }

  async findAll(companyId: number) {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { companyId },
      include: { stocks: { select: { quantity: true } } },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    return warehouses.map(({ stocks, ...warehouse }) => ({
      ...warehouse,
      references: stocks.length,
      totalQuantity: round2(
        stocks.reduce((acc, stock) => acc + stock.quantity, 0),
      ),
    }));
  }

  async findOne(companyId: number, id: number) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, companyId },
      include: {
        stocks: {
          include: { product: { select: { id: true, name: true, sku: true } } },
          orderBy: { quantity: 'desc' },
        },
      },
    });
    if (!warehouse) throw new NotFoundException('Entrepôt introuvable');
    return warehouse;
  }

  async update(companyId: number, id: number, dto: UpdateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, companyId },
    });
    if (!warehouse) throw new NotFoundException('Entrepôt introuvable');

    if (dto.code && dto.code !== warehouse.code) {
      await this.assertCodeFree(companyId, dto.code);
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.warehouse.updateMany({
          where: { companyId, id: { not: id } },
          data: { isDefault: false },
        });
      }
      return tx.warehouse.update({ where: { id }, data: dto });
    });
  }

  async remove(companyId: number, id: number) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, companyId },
      include: { _count: { select: { movements: true } } },
    });
    if (!warehouse) throw new NotFoundException('Entrepôt introuvable');

    if (warehouse._count.movements > 0) {
      // On préserve l'historique des mouvements : désactivation, pas suppression.
      await this.prisma.warehouse.update({
        where: { id },
        data: { isActive: false, isDefault: false },
      });
      return {
        message: `Entrepôt « ${warehouse.name} » désactivé (${warehouse._count.movements} mouvement(s) conservé(s))`,
        archived: true,
      };
    }

    await this.prisma.warehouse.delete({ where: { id } });
    return {
      message: `Entrepôt « ${warehouse.name} » supprimé`,
      archived: false,
    };
  }

  private async assertCodeFree(companyId: number, code: string) {
    const taken = await this.prisma.warehouse.findUnique({
      where: { companyId_code: { companyId, code } },
      select: { id: true },
    });
    if (taken)
      throw new ConflictException(`Le code « ${code} » est déjà utilisé`);
  }
}
