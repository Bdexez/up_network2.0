import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StockMovementType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { round2 } from 'src/common/documents/totals';
import { AdjustStockDto, TransferStockDto } from './dto/adjust-stock.dto';

interface MovementInput {
  companyId: number;
  userId: number;
  productId: number;
  warehouseId: number;
  /** Signée : positive pour une entrée, négative pour une sortie. */
  quantity: number;
  type: StockMovementType;
  reason?: string;
  documentRef?: string;
}

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  /**
   * Applique un mouvement et met à jour le niveau, dans la même transaction.
   * C'est le seul chemin par lequel une quantité change : le journal et les
   * niveaux ne peuvent donc pas diverger.
   */
  async recordMovement(tx: Prisma.TransactionClient, input: MovementInput) {
    const quantity = round2(input.quantity);
    if (quantity === 0) return null;

    const stock = await tx.stock.upsert({
      where: {
        productId_warehouseId: {
          productId: input.productId,
          warehouseId: input.warehouseId,
        },
      },
      update: { quantity: { increment: quantity } },
      create: {
        productId: input.productId,
        warehouseId: input.warehouseId,
        quantity,
      },
    });

    return tx.stockMovement.create({
      data: {
        companyId: input.companyId,
        createdById: input.userId,
        productId: input.productId,
        warehouseId: input.warehouseId,
        type: input.type,
        quantity,
        resultingQuantity: round2(stock.quantity),
        reason: input.reason,
        documentRef: input.documentRef,
      },
    });
  }

  /**
   * Sortie ou entrée de stock pour toutes les lignes d'un document.
   * Les lignes sans produit et les produits non suivis (services) sont ignorés.
   */
  async applyDocumentLines(
    tx: Prisma.TransactionClient,
    params: {
      companyId: number;
      userId: number;
      warehouseId: number;
      documentRef: string;
      direction: 'IN' | 'OUT';
      lines: { productId: number | null; quantity: number }[];
    },
  ) {
    const productIds = [
      ...new Set(
        params.lines
          .map((line) => line.productId)
          .filter((id): id is number => id !== null),
      ),
    ];
    if (productIds.length === 0) return;

    const tracked = await tx.product.findMany({
      where: { id: { in: productIds }, companyId: params.companyId, manageStock: true },
      select: { id: true },
    });
    const trackedIds = new Set(tracked.map((product) => product.id));

    const sign = params.direction === 'IN' ? 1 : -1;

    for (const line of params.lines) {
      if (line.productId === null || !trackedIds.has(line.productId)) continue;

      await this.recordMovement(tx, {
        companyId: params.companyId,
        userId: params.userId,
        productId: line.productId,
        warehouseId: params.warehouseId,
        quantity: sign * line.quantity,
        type: params.direction === 'IN' ? StockMovementType.IN : StockMovementType.OUT,
        documentRef: params.documentRef,
      });
    }
  }

  /** Entrepôt à utiliser quand le document n'en précise aucun. */
  async resolveWarehouse(companyId: number, warehouseId?: number | null) {
    if (warehouseId) {
      const warehouse = await this.prisma.warehouse.findFirst({
        where: { id: warehouseId, companyId },
        select: { id: true },
      });
      if (!warehouse) throw new NotFoundException('Entrepôt introuvable');
      return warehouse.id;
    }

    const fallback =
      (await this.prisma.warehouse.findFirst({
        where: { companyId, isActive: true, isDefault: true },
        select: { id: true },
      })) ??
      (await this.prisma.warehouse.findFirst({
        where: { companyId, isActive: true },
        orderBy: { id: 'asc' },
        select: { id: true },
      }));

    if (!fallback) {
      throw new BadRequestException(
        "Aucun entrepôt n'est défini : créez-en un avant de mouvementer du stock",
      );
    }
    return fallback.id;
  }

  /** Niveaux par produit, tous entrepôts confondus, avec l'alerte de seuil. */
  async levels(
    companyId: number,
    filters: { warehouseId?: number; search?: string; belowAlert?: boolean },
  ) {
    const where: Prisma.ProductWhereInput = { companyId, manageStock: true };
    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        stocks: {
          where: filters.warehouseId ? { warehouseId: filters.warehouseId } : undefined,
          include: { warehouse: { select: { id: true, name: true, code: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    const rows = products.map((product) => {
      const quantity = round2(
        product.stocks.reduce((acc, stock) => acc + stock.quantity, 0),
      );
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        stockAlert: product.stockAlert,
        costPrice: product.costPrice,
        quantity,
        value: round2(quantity * product.costPrice),
        belowAlert: quantity < product.stockAlert,
        byWarehouse: product.stocks.map((stock) => ({
          warehouseId: stock.warehouseId,
          warehouse: stock.warehouse.name,
          quantity: round2(stock.quantity),
        })),
      };
    });

    return filters.belowAlert ? rows.filter((row) => row.belowAlert) : rows;
  }

  movements(
    companyId: number,
    filters: { productId?: number; warehouseId?: number; limit?: number },
  ) {
    return this.prisma.stockMovement.findMany({
      where: {
        companyId,
        productId: filters.productId,
        warehouseId: filters.warehouseId,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        warehouse: { select: { id: true, name: true } },
        createdBy: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(filters.limit ?? 100, 300),
    });
  }

  /** Correction manuelle d'un niveau (inventaire, casse, erreur de saisie). */
  async adjust(companyId: number, userId: number, dto: AdjustStockDto) {
    await this.assertProduct(companyId, dto.productId);
    await this.resolveWarehouse(companyId, dto.warehouseId);

    return this.prisma.$transaction((tx) =>
      this.recordMovement(tx, {
        companyId,
        userId,
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        quantity: dto.quantity,
        type: StockMovementType.ADJUSTMENT,
        reason: dto.reason ?? 'Ajustement manuel',
      }),
    );
  }

  /** Transfert entre deux entrepôts : une sortie et une entrée liées. */
  async transfer(companyId: number, userId: number, dto: TransferStockDto) {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException("L'entrepôt source et la destination sont identiques");
    }
    if (dto.quantity <= 0) {
      throw new BadRequestException('La quantité transférée doit être positive');
    }

    await this.assertProduct(companyId, dto.productId);
    await this.resolveWarehouse(companyId, dto.fromWarehouseId);
    await this.resolveWarehouse(companyId, dto.toWarehouseId);

    const reason = dto.reason ?? 'Transfert entre entrepôts';

    return this.prisma.$transaction(async (tx) => {
      await this.recordMovement(tx, {
        companyId,
        userId,
        productId: dto.productId,
        warehouseId: dto.fromWarehouseId,
        quantity: -dto.quantity,
        type: StockMovementType.TRANSFER,
        reason,
      });
      await this.recordMovement(tx, {
        companyId,
        userId,
        productId: dto.productId,
        warehouseId: dto.toWarehouseId,
        quantity: dto.quantity,
        type: StockMovementType.TRANSFER,
        reason,
      });
      return { message: 'Transfert enregistré' };
    });
  }

  private async assertProduct(companyId: number, productId: number) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, companyId },
      select: { id: true, manageStock: true },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    if (!product.manageStock) {
      throw new BadRequestException("Ce produit n'est pas suivi en stock");
    }
  }
}
