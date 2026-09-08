import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
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

  findAll(companyId: number, search?: string) {
    const where: Prisma.ProductWhereInput = { companyId };

    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: { stocks: { select: { quantity: true } } },
      orderBy: { createdAt: 'desc' },
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
    const [orderLines, quoteLines, invoiceLines, purchaseLines] = await Promise.all([
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
