import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DocumentType,
  InvoiceStatus,
  OrderStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentLinesService } from 'src/common/documents/lines.service';
import { NumberingService } from 'src/common/documents/numbering.service';
import {
  assertEditable,
  assertTransition,
} from 'src/common/documents/workflow';
import { assertVersion } from 'src/common/documents/optimistic-lock';
import { computeDocumentTotals } from 'src/common/documents/totals';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { resolveCurrency, toBaseAmounts } from 'src/common/documents/currency';
import { DocumentPdfService } from 'src/common/documents/document-pdf.service';
import { StockService } from 'src/modules/stock/stock.service';
import {
  computeDueDate,
  resolvePaymentTermsDays,
} from 'src/common/documents/payment-terms';
import { CreateOrderDto } from './dto/create-order.dto';
import type { FulfilLineDto } from './dto/fulfil-order.dto';
import { isFullyFulfilled, remainingOn, resolveFulfilment } from './fulfilment';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ORDER_EDITABLE,
  ORDER_SHIPPABLE,
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
    private pdfService: DocumentPdfService,
  ) {}

  async create(companyId: number, userId: number, dto: CreateOrderDto) {
    await this.assertPartner(companyId, dto.partnerId);
    const built = await this.linesService.build(companyId, dto.lines);

    const money = await this.resolveDocumentCurrency(companyId, dto, built);

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
          ...money,
          lines: { create: built.lines },
        },
        include: ORDER_INCLUDE,
      });
    });
  }

  findAll(
    companyId: number,
    filters: { status?: OrderStatus; partnerId?: number } & PageParams,
  ) {
    const where: Prisma.OrderWhereInput = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.partnerId) where.partnerId = filters.partnerId;

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.order.findMany({
          where,
          include: ORDER_INCLUDE,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.order.count({ where }),
      ]),
    );
  }

  async findOne(companyId: number, id: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, companyId },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException('Commande introuvable');

    return {
      ...order,
      vatBreakdown: computeDocumentTotals(order.lines).vatBreakdown,
      // Reliquats calculés une fois ici plutôt que dans chaque écran.
      lines: order.lines.map((line) => ({
        ...line,
        remainingToShip: remainingOn(line, 'shipped'),
        remainingToInvoice: remainingOn(line, 'invoiced'),
      })),
    };
  }

  async update(companyId: number, id: number, dto: UpdateOrderDto) {
    const order = await this.findOne(companyId, id);
    assertEditable(order.status, ORDER_EDITABLE, ORDER_STATUS_LABEL);
    assertVersion(order, dto.version);

    if (dto.partnerId) await this.assertPartner(companyId, dto.partnerId);

    const built = dto.lines
      ? await this.linesService.build(companyId, dto.lines)
      : null;

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
          version: { increment: 1 },
          partnerId: dto.partnerId,
          date: dto.date ? new Date(dto.date) : undefined,
          deliveryDate: dto.deliveryDate
            ? new Date(dto.deliveryDate)
            : undefined,
          notes: dto.notes,
          ...(built
            ? {
                totalHT: built.totalHT,
                totalVat: built.totalVat,
                totalTTC: built.totalTTC,
                ...toBaseAmounts(built, order.exchangeRate),
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

    assertTransition(
      order.status,
      status,
      ORDER_TRANSITIONS,
      ORDER_STATUS_LABEL,
    );

    return this.prisma.order.update({
      where: { id },
      data: { status, version: { increment: 1 } },
      include: ORDER_INCLUDE,
    });
  }

  /**
   * Expédie tout ou partie de la commande et sort le stock correspondant.
   * Le statut ne passe à « expédiée » que lorsqu'il ne reste plus de reliquat.
   */
  async ship(
    companyId: number,
    userId: number,
    id: number,
    options: { warehouseId?: number; lines?: FulfilLineDto[] } = {},
  ) {
    const order = await this.findOne(companyId, id);

    if (!ORDER_SHIPPABLE.includes(order.status)) {
      throw new BadRequestException(
        `Commande au statut « ${ORDER_STATUS_LABEL[order.status]} » : validez-la avant de l'expédier.`,
      );
    }

    const shipments = resolveFulfilment(order.lines, 'shipped', options.lines);
    const resolvedWarehouse = await this.stockService.resolveWarehouse(
      companyId,
      options.warehouseId,
    );

    return this.prisma.$transaction(async (tx) => {
      await this.stockService.applyDocumentLines(tx, {
        companyId,
        userId,
        warehouseId: resolvedWarehouse,
        documentRef: order.ref,
        direction: 'OUT',
        lines: shipments.map(({ line, quantity }) => ({
          productId: line.productId,
          quantity,
        })),
      });

      for (const { line, quantity } of shipments) {
        await tx.orderLine.update({
          where: { id: line.id },
          data: { shippedQuantity: { increment: quantity } },
        });
      }

      const updatedLines = await tx.orderLine.findMany({
        where: { orderId: id },
      });
      const complete = isFullyFulfilled(updatedLines, 'shipped');

      // Une commande déjà facturée garde son statut : « facturée » est plus
      // avancé qu'« expédiée », la faire reculer perdrait l'information.
      const settled = order.status === OrderStatus.BILLED;

      return tx.order.update({
        where: { id },
        data: {
          status: complete && !settled ? OrderStatus.SHIPPED : order.status,
          shippedAt: complete ? new Date() : order.shippedAt,
          version: { increment: 1 },
        },
        include: ORDER_INCLUDE,
      });
    });
  }

  /**
   * Crée la facture correspondant à la commande. Les lignes sont recopiées :
   * une facture émise est un document figé, indépendant de la commande.
   */
  async convertToInvoice(
    companyId: number,
    userId: number,
    id: number,
    selection?: FulfilLineDto[],
  ) {
    const order = await this.findOne(companyId, id);

    if (
      order.status === OrderStatus.DRAFT ||
      order.status === OrderStatus.CANCELLED
    ) {
      assertTransition(
        order.status,
        OrderStatus.BILLED,
        ORDER_TRANSITIONS,
        ORDER_STATUS_LABEL,
      );
    }

    const toInvoice = resolveFulfilment(order.lines, 'invoiced', selection);

    // Les lignes facturées reprennent le tarif de la commande, sur la seule
    // quantité facturée cette fois-ci.
    const built = this.linesService.toPersistable(
      toInvoice.map(({ line, quantity }) => ({ ...line, quantity })),
    );
    const dueDate = await this.defaultDueDate(companyId, order.partnerId);

    return this.prisma.$transaction(async (tx) => {
      const ref = await this.numbering.next(
        tx,
        companyId,
        DocumentType.INVOICE,
      );

      const invoice = await tx.invoice.create({
        data: {
          ref,
          companyId,
          partnerId: order.partnerId,
          createdById: userId,
          orderId: order.id,
          status: InvoiceStatus.DRAFT,
          notes: order.notes,
          dueDate,
          totalHT: built.totalHT,
          totalVat: built.totalVat,
          totalTTC: built.totalTTC,
          // La facture hérite de la devise et du taux de la commande.
          currency: order.currency,
          exchangeRate: order.exchangeRate,
          ...toBaseAmounts(built, order.exchangeRate),
          lines: { create: built.lines },
        },
        include: {
          partner: { select: { id: true, name: true } },
          lines: { orderBy: { position: 'asc' } },
        },
      });

      for (const { line, quantity } of toInvoice) {
        await tx.orderLine.update({
          where: { id: line.id },
          data: { invoicedQuantity: { increment: quantity } },
        });
      }

      const updatedLines = await tx.orderLine.findMany({
        where: { orderId: id },
      });

      await tx.order.update({
        where: { id },
        data: {
          status: isFullyFulfilled(updatedLines, 'invoiced')
            ? OrderStatus.BILLED
            : order.status,
          version: { increment: 1 },
        },
      });

      return invoice;
    });
  }

  /** Bon de commande en PDF, rendu à la volée. */
  async renderPdf(companyId: number, id: number) {
    const order = await this.findOne(companyId, id);
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
    });
    const partner = await this.prisma.partner.findUniqueOrThrow({
      where: { id: order.partnerId },
    });

    const buffer = await this.pdfService.build({
      kind: 'ORDER',
      companyId,
      ref: order.ref,
      date: order.date,
      secondaryDate: order.deliveryDate,
      notes: order.notes,
      issuer: company,
      recipient: partner,
      lines: order.lines,
      vatBreakdown: order.vatBreakdown,
      totalHT: order.totalHT,
      totalVat: order.totalVat,
      totalTTC: order.totalTTC,
    });

    return { buffer, fileName: `${order.ref}.pdf` };
  }

  async remove(companyId: number, id: number) {
    const order = await this.findOne(companyId, id);
    assertEditable(order.status, ORDER_EDITABLE, ORDER_STATUS_LABEL);

    await this.prisma.order.delete({ where: { id } });
    return { message: `Commande ${order.ref} supprimée` };
  }

  /** Échéance déduite des conditions de règlement du tiers, sinon de la société. */
  private async defaultDueDate(companyId: number, partnerId: number) {
    const [company, partner] = await Promise.all([
      this.prisma.company.findUniqueOrThrow({
        where: { id: companyId },
        select: { paymentTermsDays: true },
      }),
      this.prisma.partner.findUniqueOrThrow({
        where: { id: partnerId },
        select: { paymentTermsDays: true },
      }),
    ]);

    return computeDueDate(
      new Date(),
      resolvePaymentTermsDays(
        partner.paymentTermsDays,
        company.paymentTermsDays,
      ),
    );
  }

  /**
   * Devise du document et montants convertis. La devise société sert de
   * référence : c'est dans celle-ci que les états consolidés s'additionnent.
   */
  private async resolveDocumentCurrency(
    companyId: number,
    dto: { currency?: string; exchangeRate?: number },
    totals?: { totalHT: number; totalTTC: number },
  ) {
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: { currency: true },
    });

    const context = resolveCurrency(company.currency, dto);
    return {
      ...context,
      ...toBaseAmounts(
        totals ?? { totalHT: 0, totalTTC: 0 },
        context.exchangeRate,
      ),
    };
  }

  private async assertPartner(companyId: number, partnerId: number) {
    const partner = await this.prisma.partner.findFirst({
      where: { id: partnerId, companyId },
      select: { id: true },
    });
    if (!partner) throw new NotFoundException('Client introuvable');
  }
}
