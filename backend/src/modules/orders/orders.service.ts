import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType, InvoiceStatus, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentLinesService } from 'src/common/documents/lines.service';
import { NumberingService } from 'src/common/documents/numbering.service';
import { assertEditable, assertTransition } from 'src/common/documents/workflow';
import { computeDocumentTotals } from 'src/common/documents/totals';
import { StockService } from 'src/modules/stock/stock.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ORDER_EDITABLE,
  ORDER_STATUS_LABEL,
  ORDER_TRANSITIONS,
} from './order-status';

const ORDER_INCLUDE = {
  partner: { select: { id: true, name: true, email: true, city: true } },
  createdBy: { select: { id: true, username: true } },
  lines: { orderBy: { position: 'asc' } },
  quote: { select: { id: true, ref: true } },
  invoices: { select: { id: true, ref: true, status: true, totalTTC: true } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private numbering: NumberingService,
    private linesService: DocumentLinesService,
    private stockService: StockService,
  ) {}

  async create(companyId: number, userId: number, dto: CreateOrderDto) {
    await this.assertPartner(companyId, dto.partnerId);
    const built = await this.linesService.build(companyId, dto.lines);

    return this.prisma.$transaction(async (tx) => {
      const ref = await this.numbering.next(tx, companyId, DocumentType.ORDER);

      return tx.order.create({
        data: {
          ref,
          companyId,
          partnerId: dto.partnerId,
          createdById: userId,
          date: dto.date ? new Date(dto.date) : new Date(),
          deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
          notes: dto.notes,
          totalHT: built.totalHT,
          totalVat: built.totalVat,
          totalTTC: built.totalTTC,
          lines: { create: built.lines },
        },
        include: ORDER_INCLUDE,
      });
    });
  }

  findAll(companyId: number, filters: { status?: OrderStatus; partnerId?: number }) {
    const where: Prisma.OrderWhereInput = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.partnerId) where.partnerId = filters.partnerId;

    return this.prisma.order.findMany({
      where,
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
    return { ...order, vatBreakdown: computeDocumentTotals(order.lines).vatBreakdown };
  }

  async update(companyId: number, id: number, dto: UpdateOrderDto) {
    const order = await this.findOne(companyId, id);
    assertEditable(order.status, ORDER_EDITABLE, ORDER_STATUS_LABEL);

    if (dto.partnerId) await this.assertPartner(companyId, dto.partnerId);

    const built = dto.lines ? await this.linesService.build(companyId, dto.lines) : null;

    return this.prisma.$transaction(async (tx) => {
      if (built) {
        await tx.orderLine.deleteMany({ where: { orderId: id } });
        await tx.orderLine.createMany({
          data: built.lines.map((line) => ({ ...line, orderId: id })),
        });
      }

      return tx.order.update({
        where: { id },
        data: {
          partnerId: dto.partnerId,
          date: dto.date ? new Date(dto.date) : undefined,
          deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
          notes: dto.notes,
          ...(built
            ? {
                totalHT: built.totalHT,
                totalVat: built.totalVat,
                totalTTC: built.totalTTC,
              }
            : {}),
        },
        include: ORDER_INCLUDE,
      });
    });
  }

  async changeStatus(companyId: number, id: number, status: OrderStatus) {
    const order = await this.findOne(companyId, id);

    if (status === OrderStatus.SHIPPED) {
      throw new BadRequestException(
        "L'expédition passe par POST /orders/:id/ship, qui sort aussi le stock",
      );
    }

    assertTransition(order.status, status, ORDER_TRANSITIONS, ORDER_STATUS_LABEL);

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: ORDER_INCLUDE,
    });
  }

  /** Marque la commande expédiée et sort le stock correspondant. */
  async ship(companyId: number, userId: number, id: number, warehouseId?: number) {
    const order = await this.findOne(companyId, id);
    assertTransition(
      order.status,
      OrderStatus.SHIPPED,
      ORDER_TRANSITIONS,
      ORDER_STATUS_LABEL,
    );

    const resolvedWarehouse = await this.stockService.resolveWarehouse(
      companyId,
      warehouseId,
    );

    return this.prisma.$transaction(async (tx) => {
      await this.stockService.applyDocumentLines(tx, {
        companyId,
        userId,
        warehouseId: resolvedWarehouse,
        documentRef: order.ref,
        direction: 'OUT',
        lines: order.lines,
      });

      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.SHIPPED, shippedAt: new Date() },
        include: ORDER_INCLUDE,
      });
    });
  }

  /**
   * Crée la facture correspondant à la commande. Les lignes sont recopiées :
   * une facture émise est un document figé, indépendant de la commande.
   */
  async convertToInvoice(companyId: number, userId: number, id: number) {
    const order = await this.findOne(companyId, id);

    if (order.invoices.length > 0) {
      throw new BadRequestException(
        `Cette commande est déjà facturée (${order.invoices.map((i) => i.ref).join(', ')})`,
      );
    }
    assertTransition(
      order.status,
      OrderStatus.BILLED,
      ORDER_TRANSITIONS,
      ORDER_STATUS_LABEL,
    );

    const built = this.linesService.toPersistable(order.lines);

    return this.prisma.$transaction(async (tx) => {
      const ref = await this.numbering.next(tx, companyId, DocumentType.INVOICE);

      const invoice = await tx.invoice.create({
        data: {
          ref,
          companyId,
          partnerId: order.partnerId,
          createdById: userId,
          orderId: order.id,
          status: InvoiceStatus.DRAFT,
          notes: order.notes,
          // Échéance à 30 jours, usage courant en B2B.
          dueDate: addDays(new Date(), 30),
          totalHT: built.totalHT,
          totalVat: built.totalVat,
          totalTTC: built.totalTTC,
          lines: { create: built.lines },
        },
        include: {
          partner: { select: { id: true, name: true } },
          lines: { orderBy: { position: 'asc' } },
        },
      });

      await tx.order.update({
        where: { id },
        data: { status: OrderStatus.BILLED },
      });

      return invoice;
    });
  }

  async remove(companyId: number, id: number) {
    const order = await this.findOne(companyId, id);
    assertEditable(order.status, ORDER_EDITABLE, ORDER_STATUS_LABEL);

    await this.prisma.order.delete({ where: { id } });
    return { message: `Commande ${order.ref} supprimée` };
  }

  private async assertPartner(companyId: number, partnerId: number) {
    const partner = await this.prisma.partner.findFirst({
      where: { id: partnerId, companyId },
      select: { id: true },
    });
    if (!partner) throw new NotFoundException('Client introuvable');
  }
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
