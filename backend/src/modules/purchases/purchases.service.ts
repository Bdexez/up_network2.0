import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentType, Prisma, PurchaseOrderStatus } from '@prisma/client';
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
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from './dto/purchase-order.dto';
import {
  PURCHASE_EDITABLE,
  PURCHASE_STATUS_LABEL,
  PURCHASE_TRANSITIONS,
} from './purchase-status';

const PURCHASE_INCLUDE = {
  supplier: { select: { id: true, name: true, email: true, city: true } },
  warehouse: { select: { id: true, name: true } },
  createdBy: { select: { id: true, username: true } },
  lines: { orderBy: { position: 'asc' } },
} satisfies Prisma.PurchaseOrderInclude;

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private numbering: NumberingService,
    private linesService: DocumentLinesService,
    private stockService: StockService,
    private pdfService: DocumentPdfService,
  ) {}

  async create(companyId: number, userId: number, dto: CreatePurchaseOrderDto) {
    await this.assertSupplier(companyId, dto.supplierId);
    if (dto.warehouseId)
      await this.stockService.resolveWarehouse(companyId, dto.warehouseId);

    // Les achats sont valorisés au prix d'achat du catalogue, pas au prix de vente.
    const built = await this.linesService.build(companyId, dto.lines, {
      useCostPrice: true,
    });

    const money = await this.resolveDocumentCurrency(companyId, dto, built);

    return this.prisma.$transaction(async (tx) => {
      const ref = await this.numbering.next(
        tx,
        companyId,
        DocumentType.PURCHASE_ORDER,
      );

      return tx.purchaseOrder.create({
        data: {
          ref,
          companyId,
          supplierId: dto.supplierId,
          warehouseId: dto.warehouseId,
          createdById: userId,
          date: dto.date ? new Date(dto.date) : new Date(),
          expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
          notes: dto.notes,
          totalHT: built.totalHT,
          totalVat: built.totalVat,
          totalTTC: built.totalTTC,
          ...money,
          lines: { create: built.lines },
        },
        include: PURCHASE_INCLUDE,
      });
    });
  }

  findAll(
    companyId: number,
    filters: { status?: PurchaseOrderStatus } & PageParams,
  ) {
    const where: Prisma.PurchaseOrderWhereInput = {
      companyId,
      status: filters.status,
    };

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.purchaseOrder.findMany({
          where,
          include: PURCHASE_INCLUDE,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.purchaseOrder.count({ where }),
      ]),
    );
  }

  async findOne(companyId: number, id: number) {
    const purchaseOrder = await this.prisma.purchaseOrder.findFirst({
      where: { id, companyId },
      include: PURCHASE_INCLUDE,
    });
    if (!purchaseOrder)
      throw new NotFoundException('Commande fournisseur introuvable');

    return {
      ...purchaseOrder,
      vatBreakdown: computeDocumentTotals(purchaseOrder.lines).vatBreakdown,
    };
  }

  async update(companyId: number, id: number, dto: UpdatePurchaseOrderDto) {
    const purchaseOrder = await this.findOne(companyId, id);
    assertEditable(
      purchaseOrder.status,
      PURCHASE_EDITABLE,
      PURCHASE_STATUS_LABEL,
    );
    assertVersion(purchaseOrder, dto.version);

    if (dto.supplierId) await this.assertSupplier(companyId, dto.supplierId);
    if (dto.warehouseId)
      await this.stockService.resolveWarehouse(companyId, dto.warehouseId);

    const built = dto.lines
      ? await this.linesService.build(companyId, dto.lines, {
          useCostPrice: true,
        })
      : null;

    return this.prisma.$transaction(async (tx) => {
      if (built) {
        await tx.purchaseOrderLine.deleteMany({
          where: { purchaseOrderId: id },
        });
        await tx.purchaseOrderLine.createMany({
          data: built.lines.map((line) => ({ ...line, purchaseOrderId: id })),
        });
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          version: { increment: 1 },
          supplierId: dto.supplierId,
          warehouseId: dto.warehouseId,
          date: dto.date ? new Date(dto.date) : undefined,
          expectedDate: dto.expectedDate
            ? new Date(dto.expectedDate)
            : undefined,
          notes: dto.notes,
          ...(built
            ? {
                totalHT: built.totalHT,
                totalVat: built.totalVat,
                totalTTC: built.totalTTC,
                ...toBaseAmounts(built, purchaseOrder.exchangeRate),
              }
            : {}),
        },
        include: PURCHASE_INCLUDE,
      });
    });
  }

  async changeStatus(
    companyId: number,
    id: number,
    status: PurchaseOrderStatus,
  ) {
    const purchaseOrder = await this.findOne(companyId, id);

    if (status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException(
        'La réception passe par POST /purchases/:id/receive, qui entre aussi le stock',
      );
    }

    assertTransition(
      purchaseOrder.status,
      status,
      PURCHASE_TRANSITIONS,
      PURCHASE_STATUS_LABEL,
    );

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status, version: { increment: 1 } },
      include: PURCHASE_INCLUDE,
    });
  }

  /** Réceptionne la commande et entre les quantités en stock. */
  async receive(
    companyId: number,
    userId: number,
    id: number,
    warehouseId?: number,
  ) {
    const purchaseOrder = await this.findOne(companyId, id);
    assertTransition(
      purchaseOrder.status,
      PurchaseOrderStatus.RECEIVED,
      PURCHASE_TRANSITIONS,
      PURCHASE_STATUS_LABEL,
    );

    const resolvedWarehouse = await this.stockService.resolveWarehouse(
      companyId,
      warehouseId ?? purchaseOrder.warehouseId,
    );

    return this.prisma.$transaction(async (tx) => {
      await this.stockService.applyDocumentLines(tx, {
        companyId,
        userId,
        warehouseId: resolvedWarehouse,
        documentRef: purchaseOrder.ref,
        direction: 'IN',
        lines: purchaseOrder.lines,
      });

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderStatus.RECEIVED,
          receivedAt: new Date(),
          warehouseId: resolvedWarehouse,
        },
        include: PURCHASE_INCLUDE,
      });
    });
  }

  /** Commande fournisseur en PDF, à envoyer au fournisseur. */
  async renderPdf(companyId: number, id: number) {
    const purchaseOrder = await this.findOne(companyId, id);
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
    });
    const supplier = await this.prisma.partner.findUniqueOrThrow({
      where: { id: purchaseOrder.supplierId },
    });

    const buffer = await this.pdfService.build({
      kind: 'PURCHASE_ORDER',
      companyId,
      ref: purchaseOrder.ref,
      date: purchaseOrder.date,
      secondaryDate: purchaseOrder.expectedDate,
      notes: purchaseOrder.notes,
      issuer: company,
      recipient: supplier,
      lines: purchaseOrder.lines,
      vatBreakdown: purchaseOrder.vatBreakdown,
      totalHT: purchaseOrder.totalHT,
      totalVat: purchaseOrder.totalVat,
      totalTTC: purchaseOrder.totalTTC,
    });

    return { buffer, fileName: `${purchaseOrder.ref}.pdf` };
  }

  async remove(companyId: number, id: number) {
    const purchaseOrder = await this.findOne(companyId, id);
    assertEditable(
      purchaseOrder.status,
      PURCHASE_EDITABLE,
      PURCHASE_STATUS_LABEL,
    );

    await this.prisma.purchaseOrder.delete({ where: { id } });
    return { message: `Commande fournisseur ${purchaseOrder.ref} supprimée` };
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

  private async assertSupplier(companyId: number, supplierId: number) {
    const supplier = await this.prisma.partner.findFirst({
      where: { id: supplierId, companyId },
      select: { id: true, type: true },
    });
    if (!supplier) throw new NotFoundException('Fournisseur introuvable');
    if (supplier.type === 'CUSTOMER') {
      throw new BadRequestException(
        'Ce tiers est un client : passez son type à « fournisseur » pour lui passer commande',
      );
    }
  }
}
