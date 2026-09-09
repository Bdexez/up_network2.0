import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, data: CreateProductDto) {
    await this.assertSkuFree(companyId, data.sku);

    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: { defaultVatRate: true },
    });

    return this.prisma.product.create({
      data: {
        ...data,
        companyId,
        vatRate: data.vatRate ?? company.defaultVatRate,
        // Un service n'a pas de stock à suivre, sauf demande explicite.
        manageStock: data.manageStock ?? data.type !== 'SERVICE',
      },
    });
  }

  findAll(companyId: number, filters: { search?: string } & PageParams) {
    const where: Prisma.ProductWhereInput = { companyId };

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          include: { stocks: { select: { quantity: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.product.count({ where }),
      ]),
    );
  }

  /** Catalogue complet et allégé, pour les sélecteurs de lignes de document. */
  findOptions(companyId: number) {
    return this.prisma.product.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        costPrice: true,
        vatRate: true,
        type: true,
        manageStock: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(companyId: number, id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async update(companyId: number, id: number, data: UpdateProductDto) {
    const product = await this.findOne(companyId, id);
    if (data.sku && data.sku !== product.sku) {
      await this.assertSkuFree(companyId, data.sku);
    }
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(companyId: number, id: number) {
    await this.findOne(companyId, id);

    // Un produit référencé par un document commercial n'est jamais supprimé :
    // cela viderait le libellé d'une facture déjà émise.
    const [orderLines, quoteLines, invoiceLines, purchaseLines] =
      await Promise.all([
        this.prisma.orderLine.count({ where: { productId: id } }),
        this.prisma.quoteLine.count({ where: { productId: id } }),
        this.prisma.invoiceLine.count({ where: { productId: id } }),
        this.prisma.purchaseOrderLine.count({ where: { productId: id } }),
      ]);
    const linesCount = orderLines + quoteLines + invoiceLines + purchaseLines;

    if (linesCount > 0) {
      throw new ConflictException(
        `Impossible de supprimer : ce produit apparaît dans ${linesCount} ligne(s) de document`,
      );
    }

    await this.prisma.product.delete({ where: { id } });
    return { message: `Produit ${id} supprimé avec succès` };
  }

  private async assertSkuFree(companyId: number, sku: string) {
    const taken = await this.prisma.product.findUnique({
      where: { companyId_sku: { companyId, sku } },
      select: { id: true },
    });
    if (taken) {
      throw new ConflictException(`La référence "${sku}" existe déjà`);
    }
  }
}
