import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { round2 } from 'src/common/documents/totals';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: number, invoiceId: number) {
    await this.assertInvoice(companyId, invoiceId);

    return this.prisma.payment.findMany({
      where: { invoiceId },
      include: { createdBy: { select: { id: true, username: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async create(
    companyId: number,
    userId: number,
    invoiceId: number,
    dto: CreatePaymentDto,
  ) {
    const invoice = await this.assertInvoice(companyId, invoiceId);

    if (invoice.status === InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Validez la facture avant d’enregistrer un règlement',
      );
    }
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cette facture est annulée');
    }

    const remaining = round2(invoice.totalTTC - invoice.paidAmount);
    if (dto.amount > remaining) {
      throw new BadRequestException(
        `Le règlement dépasse le reste à payer (${remaining.toFixed(2)} €)`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          createdById: userId,
          amount: round2(dto.amount),
          method: dto.method,
          date: dto.date ? new Date(dto.date) : new Date(),
          reference: dto.reference,
          notes: dto.notes,
        },
        include: { createdBy: { select: { id: true, username: true } } },
      });

      await this.refreshInvoice(tx, invoiceId);
      return payment;
    });
  }

  async remove(companyId: number, invoiceId: number, paymentId: number) {
    await this.assertInvoice(companyId, invoiceId);

    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, invoiceId },
    });
    if (!payment) throw new NotFoundException('Règlement introuvable');

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.delete({ where: { id: paymentId } });
      await this.refreshInvoice(tx, invoiceId);
      return { message: 'Règlement supprimé' };
    });
  }

  /**
   * Recalcule le montant encaissé et en déduit le statut. Appelé après chaque
   * écriture de règlement : `paidAmount` et `status` sont dérivés des paiements,
   * jamais saisis à la main.
   */
  private async refreshInvoice(tx: Prisma.TransactionClient, invoiceId: number) {
    const invoice = await tx.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      select: { totalTTC: true, status: true },
    });

    const aggregate = await tx.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true },
    });
    const paidAmount = round2(aggregate._sum.amount ?? 0);

    // Une facture annulée le reste, quels que soient les règlements.
    const status =
      invoice.status === InvoiceStatus.CANCELLED
        ? InvoiceStatus.CANCELLED
        : paidAmount <= 0
          ? InvoiceStatus.UNPAID
          : paidAmount >= invoice.totalTTC
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIALLY_PAID;

    await tx.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount, status },
    });
  }

  private async assertInvoice(companyId: number, invoiceId: number) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
      select: { id: true, status: true, totalTTC: true, paidAmount: true },
    });
    if (!invoice) throw new NotFoundException('Facture introuvable');
    return invoice;
  }
}
