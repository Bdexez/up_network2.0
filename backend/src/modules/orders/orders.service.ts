import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOrderDto) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: data.partnerId },
    });
    if (!partner) throw new NotFoundException('Client introuvable');

    // Vérifie tous les produits
    const products = await this.prisma.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) } },
    });

    if (products.length !== data.items.length) {
      throw new NotFoundException('Un ou plusieurs produits sont introuvables');
    }

    // Calcule le total
    const total = data.items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId);
      return acc + (product?.price || 0) * item.quantity;
    }, 0);

    return this.prisma.order.create({
      data: {
        companyId: data.companyId,
        partnerId: data.partnerId,
        createdById: data.createdById,
        total,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: products.find((p) => p.id === item.productId)?.price ?? 0,
          })),
        },
      },
      include: { items: { include: { product: true } }, partner: true },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.order.findMany({
      where: { companyId },
      include: { partner: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { partner: true, items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async update(id: number, data: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Commande introuvable');

    let total = order.total;

    if (data.items && data.items.length > 0) {
      const products = await this.prisma.product.findMany({
        where: { id: { in: data.items.map((i) => i.productId) } },
      });
      total = data.items.reduce((acc, item) => {
        const product = products.find((p) => p.id === item.productId);
        return acc + (product?.price || 0) * item.quantity;
      }, 0);

      await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
      await this.prisma.orderItem.createMany({
        data: data.items.map((item) => ({
          orderId: id,
          productId: item.productId,
          quantity: item.quantity,
          price: products.find((p) => p.id === item.productId)?.price ?? 0,
        })),
      });
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        total,
        partnerId: data.partnerId ?? order.partnerId,
      },
      include: { items: { include: { product: true } }, partner: true },
    });
  }

  async remove(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    return this.prisma.order.delete({ where: { id } });
  }
}
