import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async generate(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        partner: true,
        company: true,
        items: { include: { product: true } },
      },
    });

    if (!order) throw new NotFoundException('Commande introuvable');
    if (await this.prisma.invoice.findUnique({ where: { orderId } })) {
      throw new Error('Une facture existe déjà pour cette commande');
    }

    // Calcul du total (sécurité)
    const total = order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    // Génération du PDF
    const invoicesDir = path.join(process.cwd(), 'invoices');
    if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

    const pdfPath = path.join(invoicesDir, `invoice_${orderId}.pdf`);
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(20).text('FACTURE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Entreprise: ${order.company.name}`);
    doc.text(`Client: ${order.partner.name}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(12).text('Produits :');
    doc.moveDown();

    order.items.forEach((item) => {
      doc.text(
        `${item.product.name} — Qté: ${item.quantity} — Prix: ${item.price.toFixed(
          2,
        )} €`,
      );
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: ${total.toFixed(2)} €`, { align: 'right' });
    doc.end();

    await new Promise<void>((resolve) => {
      stream.on('finish', resolve);
    });

    // Enregistre la facture en base
    return this.prisma.invoice.create({
      data: {
        orderId,
        total,
        pdfUrl: pdfPath,
      },
    });
  }

  async findAll() {
    return this.prisma.invoice.findMany({
      include: { order: { include: { partner: true, company: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { order: { include: { partner: true, company: true } } },
    });
    if (!invoice) throw new NotFoundException('Facture introuvable');
    return invoice;
  }
}
