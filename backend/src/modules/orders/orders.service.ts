import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

const ORDER_INCLUDE = {
  partner: true,
  items: { include: { product: true } },
  invoice: true,
  createdBy: { select: { id: true, username: true, email: true } },
} as const;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, createdById: number, data: CreateOrderDto) {
    await this.assertPartner(companyId, data.partnerId);
    const priced = await this.priceItems(companyId, data.items);

    return this.prisma.order.create({
      data: {
        companyId,
        partnerId: data.partnerId,
        createdById,
        total: priced.total,
        items: { create: priced.lines },
      },
      include: ORDER_INCLUDE,
    });
  }

  findAll(companyId: number) {
    return this.prisma.order.findMany({
      where: { companyId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: number, id: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, companyId },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async update(companyId: number, id: number, data: UpdateOrderDto) {
    const order = await this.findOne(companyId, id);

    if (order.invoice) {
      throw new ConflictException(
        'Commande déjà facturée : elle ne peut plus être modifiée',
      );
    }

    if (data.partnerId) {
      await this.assertPartner(companyId, data.partnerId);
    }

    // Sans nouvelles lignes, le total reste celui déjà calculé.
    if (!data.items) {
      return this.prisma.order.update({
        where: { id },
        data: { partnerId: data.partnerId ?? order.partnerId },
        include: ORDER_INCLUDE,
      });
    }

    const priced = await this.priceItems(companyId, data.items);

    // Lignes + total réécrits d'un bloc : jamais de total désynchronisé.
    return this.prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.orderItem.createMany({
        data: priced.lines.map((line) => ({ ...line, orderId: id })),
      });
      return tx.order.update({
        where: { id },
        data: {
          total: priced.total,
          partnerId: data.partnerId ?? order.partnerId,
        },
        include: ORDER_INCLUDE,
      });
    });
  }

  async remove(companyId: number, id: number) {
    const order = await this.findOne(companyId, id);
    if (order.invoice) {
      throw new ConflictException(
        'Commande déjà facturée : supprimez d’abord la facture',
      );
    }
    await this.prisma.order.delete({ where: { id } });
    return { message: `Commande ${id} supprimée` };
  }

  // -------------------------------------------------------------------------

  /** Valorise les lignes au prix courant du catalogue de la société. */
  private async priceItems(companyId: number, items: OrderItemDto[]) {
    const productIds = [...new Set(items.map((i) => i.productId))];

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, companyId },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException(
        'Un ou plusieurs produits sont introuvables dans cette société',
      );
    }

    const priceById = new Map(products.map((p) => [p.id, p.price]));

    const lines = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: priceById.get(item.productId) as number,
    }));

    const total = lines.reduce(
      (acc, line) => acc + line.price * line.quantity,
      0,
    );

    return { lines, total: Math.round(total * 100) / 100 };
  }

  private async assertPartner(companyId: number, partnerId: number) {
    const partner = await this.prisma.partner.findFirst({
      where: { id: partnerId, companyId },
      select: { id: true },
    });
    if (!partner) throw new NotFoundException('Client introuvable');
  }
}
