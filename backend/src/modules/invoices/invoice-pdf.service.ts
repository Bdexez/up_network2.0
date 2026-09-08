import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { round2 } from 'src/common/documents/totals';

export const INVOICES_DIR = path.join(process.cwd(), 'invoices');

export interface InvoicePdfData {
  ref: string;
  date: Date;
  dueDate: Date | null;
  notes: string | null;
  company: {
    name: string;
    address: string | null;
    zipCode: string | null;
    city: string | null;
    country: string | null;
    email: string | null;
    phone: string | null;
    vatNumber: string | null;
  };
  partner: {
    name: string;
    address: string | null;
    zipCode: string | null;
    city: string | null;
    country: string | null;
    vatNumber: string | null;
  };
  lines: {
    label: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    vatRate: number;
    totalHT: number;
  }[];
  vatBreakdown: { rate: number; base: number; amount: number }[];
  totalHT: number;
  totalVat: number;
  totalTTC: number;
  paidAmount: number;
}

/** Mise en page du PDF de facture. Isolée pour garder InvoicesService lisible. */
@Injectable()
export class InvoicePdfService {
  async render(data: InvoicePdfData): Promise<string> {
    await fs.promises.mkdir(INVOICES_DIR, { recursive: true });

    const fileName = `${data.ref}.pdf`;
    const filePath = path.join(INVOICES_DIR, fileName);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    this.drawHeader(doc, data);
    this.drawParties(doc, data);
    const tableBottom = this.drawLines(doc, data);
    this.drawTotals(doc, data, tableBottom);
    this.drawFooter(doc, data);

    doc.end();
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return fileName;
  }

  // ---------------------------------------------------------------------------

  private drawHeader(doc: PDFKit.PDFDocument, data: InvoicePdfData) {
    doc.fontSize(22).fillColor('#111').text('FACTURE', { align: 'right' });
    doc.fontSize(11).fillColor('#555').text(data.ref, { align: 'right' });
    doc.text(`Date : ${formatDate(data.date)}`, { align: 'right' });
    if (data.dueDate) {
      doc.text(`Échéance : ${formatDate(data.dueDate)}`, { align: 'right' });
    }
    doc.fillColor('#111');
  }

  private drawParties(doc: PDFKit.PDFDocument, data: InvoicePdfData) {
    const top = 130;

    doc.fontSize(9).fillColor('#777').text('ÉMETTEUR', 50, top);
    doc.fontSize(11).fillColor('#111').text(data.company.name, 50, top + 14);
    doc.fontSize(10).fillColor('#444');
    for (const line of addressLines(data.company)) doc.text(line, 50);
    if (data.company.vatNumber) doc.text(`TVA : ${data.company.vatNumber}`, 50);

    doc.fontSize(9).fillColor('#777').text('CLIENT', 320, top);
    doc.fontSize(11).fillColor('#111').text(data.partner.name, 320, top + 14);
    doc.fontSize(10).fillColor('#444');
    for (const line of addressLines(data.partner)) doc.text(line, 320);
    if (data.partner.vatNumber) doc.text(`TVA : ${data.partner.vatNumber}`, 320);

    doc.fillColor('#111');
  }

  /** Tableau des lignes ; renvoie l'ordonnée de fin. */
  private drawLines(doc: PDFKit.PDFDocument, data: InvoicePdfData): number {
    const columns = { label: 50, qty: 300, price: 350, discount: 420, vat: 465, total: 505 };
    let y = 250;

    doc.fontSize(8).fillColor('#777');
    doc.text('DÉSIGNATION', columns.label, y);
    doc.text('QTÉ', columns.qty, y, { width: 40, align: 'right' });
    doc.text('P.U. HT', columns.price, y, { width: 60, align: 'right' });
    doc.text('REM.', columns.discount, y, { width: 35, align: 'right' });
    doc.text('TVA', columns.vat, y, { width: 35, align: 'right' });
    doc.text('TOTAL HT', columns.total, y, { width: 60, align: 'right' });

    y += 14;
    doc.moveTo(50, y).lineTo(565, y).strokeColor('#ddd').stroke();
    y += 8;

    doc.fontSize(9).fillColor('#111');
    for (const line of data.lines) {
      // Saut de page si la ligne ne tient plus.
      if (y > 680) {
        doc.addPage();
        y = 60;
      }

      const labelHeight = doc.heightOfString(line.label, { width: 240 });
      doc.text(line.label, columns.label, y, { width: 240 });
      doc.text(formatNumber(line.quantity), columns.qty, y, { width: 40, align: 'right' });
      doc.text(formatMoney(line.unitPrice), columns.price, y, { width: 60, align: 'right' });
      doc.text(
        line.discountPercent ? `${formatNumber(line.discountPercent)} %` : '—',
        columns.discount,
        y,
        { width: 35, align: 'right' },
      );
      doc.text(`${formatNumber(line.vatRate)} %`, columns.vat, y, {
        width: 35,
        align: 'right',
      });
      doc.text(formatMoney(line.totalHT), columns.total, y, { width: 60, align: 'right' });

      y += Math.max(labelHeight, 12) + 6;
    }

    doc.moveTo(50, y).lineTo(565, y).strokeColor('#ddd').stroke();
    return y + 12;
  }

  private drawTotals(doc: PDFKit.PDFDocument, data: InvoicePdfData, top: number) {
    let y = top;
    const labelX = 350;
    const valueX = 465;

    const row = (label: string, value: string, bold = false) => {
      doc.fontSize(bold ? 12 : 10).fillColor(bold ? '#111' : '#444');
      doc.text(label, labelX, y, { width: 110, align: 'right' });
      doc.text(value, valueX, y, { width: 100, align: 'right' });
      y += bold ? 20 : 15;
    };

    row('Total HT', formatMoney(data.totalHT));
    for (const vat of data.vatBreakdown) {
      row(`TVA ${formatNumber(vat.rate)} %`, formatMoney(vat.amount));
    }
    row('Total TTC', formatMoney(data.totalTTC), true);

    if (data.paidAmount > 0) {
      row('Déjà réglé', formatMoney(data.paidAmount));
      row('Reste à payer', formatMoney(round2(data.totalTTC - data.paidAmount)), true);
    }
  }

  private drawFooter(doc: PDFKit.PDFDocument, data: InvoicePdfData) {
    if (!data.notes) return;
    doc.fontSize(9).fillColor('#666');
    doc.text(data.notes, 50, 720, { width: 500 });
  }
}

function addressLines(party: {
  address: string | null;
  zipCode: string | null;
  city: string | null;
  country: string | null;
}): string[] {
  const lines: string[] = [];
  if (party.address) lines.push(party.address);
  const cityLine = [party.zipCode, party.city].filter(Boolean).join(' ');
  if (cityLine) lines.push(cityLine);
  if (party.country) lines.push(party.country);
  return lines;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR');
}

function formatMoney(value: number) {
  return `${value.toFixed(2)} €`;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
