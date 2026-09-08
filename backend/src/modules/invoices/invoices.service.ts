import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

const INVOICES_DIR = path.join(process.cwd(), 'invoices');

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async generate(companyId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, companyId },
      include: {
        partner: true,
        company: true,
        items: { include: { product: true } },
      },
    });

    if (!order) throw new NotFoundException('Commande introuvable');

    const existing = await this.prisma.invoice.findUnique({
      where: { orderId },
    });
    if (existing) {
      throw new ConflictException(
        'Une facture existe déjà pour cette commande',
      );
    }

    const total = order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const fileName = `invoice_${orderId}.pdf`;
    await this.writePdf(fileName, {
      companyName: order.company.name,
      partnerName: order.partner.name,
      partnerAddress: [order.partner.address, order.partner.city, order.partner.country]
        .filter(Boolean)
        .join(', '),
      orderId,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
    });

    return this.prisma.invoice.create({
      // On ne stocke que le nom de fichier : le dossier est résolu côté serveur.
      data: { orderId, total, pdfUrl: fileName },
    });
  }

  findAll(companyId: number) {
    return this.prisma.invoice.findMany({
      where: { order: { companyId } },
      include: { order: { include: { partner: true, company: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: number, id: number) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, order: { companyId } },
      include: {
        order: {
          include: {
            partner: true,
            company: true,
            items: { include: { product: true } },
          },
        },
      },
    });
    if (!invoice) throw new NotFoundException('Facture introuvable');
    return invoice;
  }

  async update(companyId: number, id: number, data: UpdateInvoiceDto) {
    await this.findOne(companyId, id);
    return this.prisma.invoice.update({ where: { id }, data });
  }

  async remove(companyId: number, id: number) {
    const invoice = await this.findOne(companyId, id);

    if (invoice.pdfUrl) {
      const filePath = this.resolvePdfPath(invoice.pdfUrl);
      if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath).catch(() => undefined);
      }
    }

    await this.prisma.invoice.delete({ where: { id } });
    return { message: `Facture ${id} supprimée` };
  }

  /** Chemin absolu du PDF, ou null si la facture n'en a pas / plus. */
  async getPdfPath(companyId: number, id: number) {
    const invoice = await this.findOne(companyId, id);
    if (!invoice.pdfUrl) {
      throw new NotFoundException('Aucun fichier PDF associé');
    }

    const filePath = this.resolvePdfPath(invoice.pdfUrl);
    if (!filePath || !fs.existsSync(filePath)) {
      throw new NotFoundException('Fichier PDF introuvable sur le serveur');
    }

    return { filePath, fileName: `facture_${invoice.orderId}.pdf` };
  }

  // -------------------------------------------------------------------------

  /**
   * Résout un nom de fichier stocké en base vers le dossier `invoices/`.
   * On ne garde que le basename : une valeur héritée contenant un chemin
   * absolu (ancien format) ou `../` ne peut pas sortir du dossier.
   */
  private resolvePdfPath(stored: string): string | null {
    const base = path.basename(stored);
    if (!base || base === '.' || base === '..') return null;
    const resolved = path.join(INVOICES_DIR, base);
    return resolved.startsWith(INVOICES_DIR) ? resolved : null;
  }

  private async writePdf(
    fileName: string,
    data: {
      companyName: string;
      partnerName: string;
      partnerAddress: string;
      orderId: number;
      items: { name: string; quantity: number; price: number }[];
      total: number;
    },
  ) {
    await fs.promises.mkdir(INVOICES_DIR, { recursive: true });
    const pdfPath = path.join(INVOICES_DIR, fileName);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(24).text('FACTURE', { align: 'center' });
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .fillColor('#666')
      .text(`N° ${String(data.orderId).padStart(6, '0')}`, { align: 'center' });
    doc.fillColor('#000').moveDown(1.5);

    doc.fontSize(11).text(`Émetteur : ${data.companyName}`);
    doc.text(`Client : ${data.partnerName}`);
    if (data.partnerAddress) doc.text(`Adresse : ${data.partnerAddress}`);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`);
    doc.moveDown(1.5);

    doc.fontSize(12).text('Détail', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10);
    for (const item of data.items) {
      const line = item.price * item.quantity;
      doc.text(
        `${item.name}  —  ${item.quantity} × ${item.price.toFixed(2)} € = ${line.toFixed(2)} €`,
      );
    }

    doc.moveDown(1.5);
    doc
      .fontSize(14)
      .text(`Total : ${data.total.toFixed(2)} €`, { align: 'right' });

    doc.end();

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }
}
