import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { round2 } from './totals';

/** Racine de stockage des PDF générés. */
export const DOCUMENTS_DIR = path.join(process.cwd(), 'documents');

export type DocumentKind = 'QUOTE' | 'ORDER' | 'INVOICE' | 'PURCHASE_ORDER';

const TITLES: Record<DocumentKind, string> = {
  QUOTE: 'DEVIS',
  ORDER: 'BON DE COMMANDE',
  INVOICE: 'FACTURE',
  PURCHASE_ORDER: 'COMMANDE FOURNISSEUR',
};

/** Libellé de la seconde date, propre à chaque type de document. */
const SECONDARY_DATE_LABEL: Record<DocumentKind, string> = {
  QUOTE: 'Valable jusqu’au',
  ORDER: 'Livraison prévue',
  INVOICE: 'Échéance',
  PURCHASE_ORDER: 'Réception attendue',
};

export interface PartyPdfData {
  name: string;
  address?: string | null;
  zipCode?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  vatNumber?: string | null;
}

export interface DocumentPdfData {
  kind: DocumentKind;
  /** Cloisonne les fichiers : deux sociétés peuvent avoir la même référence. */
  companyId: number;
  ref: string;
  date: Date;
  secondaryDate?: Date | null;
  notes?: string | null;
  issuer: PartyPdfData;
  recipient: PartyPdfData;
  lines: {
    label: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    vatRate: number;
    totalHT: number;
  }[];
  vatBreakdown: { rate: number; amount: number }[];
  totalHT: number;
  totalVat: number;
  totalTTC: number;
  /** Bloc de règlement, propre aux factures. */
  paidAmount?: number;
}

/**
 * Rendu PDF commun aux documents commerciaux. Un seul gabarit : devis,
 * commandes et factures ne diffèrent que par leur titre, la seconde date et
 * le bloc de règlement.
 */
@Injectable()
export class DocumentPdfService {
  /**
   * Rend le PDF en mémoire. Utilisé tel quel pour les devis et commandes, dont
   * le contenu peut encore bouger : on le régénère plutôt que de servir un
   * fichier périmé.
   */
  build(data: DocumentPdfData): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.drawHeader(doc, data);
      this.drawParties(doc, data);
      const tableBottom = this.drawLines(doc, data);
      this.drawTotals(doc, data, tableBottom);
      this.drawFooter(doc, data);

      doc.end();
    });
  }

  /**
   * Rend puis conserve le PDF sur disque, et renvoie son chemin relatif à
   * `DOCUMENTS_DIR`. Réservé aux factures : une facture émise est une pièce
   * comptable, son PDF doit rester identique à ce qui a été envoyé.
   */
  async save(data: DocumentPdfData): Promise<string> {
    const relativePath = documentFileName(data.companyId, data.ref);
    const filePath = path.join(DOCUMENTS_DIR, relativePath);

    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, await this.build(data));

    return relativePath;
  }

  // ---------------------------------------------------------------------------

  private drawHeader(doc: PDFKit.PDFDocument, data: DocumentPdfData) {
    doc
      .fontSize(22)
      .fillColor('#111')
      .text(TITLES[data.kind], { align: 'right' });
    doc.fontSize(11).fillColor('#555').text(data.ref, { align: 'right' });
    doc.text(`Date : ${formatDate(data.date)}`, { align: 'right' });
    if (data.secondaryDate) {
      doc.text(
        `${SECONDARY_DATE_LABEL[data.kind]} : ${formatDate(data.secondaryDate)}`,
        { align: 'right' },
      );
    }
    doc.fillColor('#111');
  }

  private drawParties(doc: PDFKit.PDFDocument, data: DocumentPdfData) {
    const top = 130;
    const recipientLabel =
      data.kind === 'PURCHASE_ORDER' ? 'FOURNISSEUR' : 'CLIENT';

    doc.fontSize(9).fillColor('#777').text('ÉMETTEUR', 50, top);
    doc
      .fontSize(11)
      .fillColor('#111')
      .text(data.issuer.name, 50, top + 14);
    doc.fontSize(10).fillColor('#444');
    for (const line of addressLines(data.issuer)) doc.text(line, 50);
    if (data.issuer.vatNumber) doc.text(`TVA : ${data.issuer.vatNumber}`, 50);

    doc.fontSize(9).fillColor('#777').text(recipientLabel, 320, top);
    doc
      .fontSize(11)
      .fillColor('#111')
      .text(data.recipient.name, 320, top + 14);
    doc.fontSize(10).fillColor('#444');
    for (const line of addressLines(data.recipient)) doc.text(line, 320);
    if (data.recipient.vatNumber)
      doc.text(`TVA : ${data.recipient.vatNumber}`, 320);

    doc.fillColor('#111');
  }

  /** Tableau des lignes ; renvoie l'ordonnée de fin. */
  private drawLines(doc: PDFKit.PDFDocument, data: DocumentPdfData): number {
    const columns = {
      label: 50,
      qty: 300,
      price: 350,
      discount: 420,
      vat: 465,
      total: 505,
    };
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
      doc.text(formatNumber(line.quantity), columns.qty, y, {
        width: 40,
        align: 'right',
      });
      doc.text(formatMoney(line.unitPrice), columns.price, y, {
        width: 60,
        align: 'right',
      });
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
      doc.text(formatMoney(line.totalHT), columns.total, y, {
        width: 60,
        align: 'right',
      });

      y += Math.max(labelHeight, 12) + 6;
    }

    doc.moveTo(50, y).lineTo(565, y).strokeColor('#ddd').stroke();
    return y + 12;
  }

  private drawTotals(
    doc: PDFKit.PDFDocument,
    data: DocumentPdfData,
    top: number,
  ) {
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

    if (data.paidAmount !== undefined && data.paidAmount > 0) {
      row('Déjà réglé', formatMoney(data.paidAmount));
      row(
        'Reste à payer',
        formatMoney(round2(data.totalTTC - data.paidAmount)),
        true,
      );
    }
  }

  private drawFooter(doc: PDFKit.PDFDocument, data: DocumentPdfData) {
    if (!data.notes) return;
    doc.fontSize(9).fillColor('#666');
    doc.text(data.notes, 50, 720, { width: 500 });
  }
}

/**
 * Chemin relatif d'un document. Le sous-dossier par société est indispensable :
 * deux sociétés peuvent émettre la même référence (FA2026-0001), et un nom de
 * fichier partagé ferait servir le PDF de l'une à l'autre.
 */
export function documentFileName(companyId: number, ref: string): string {
  return path.join(`company-${companyId}`, `${sanitize(ref)}.pdf`);
}

/**
 * Résout un chemin stocké vers `DOCUMENTS_DIR` en refusant toute sortie du
 * dossier, quelle que soit la valeur en base.
 */
export function resolveDocumentPath(stored: string | null): string | null {
  if (!stored) return null;

  const resolved = path.resolve(DOCUMENTS_DIR, stored);
  const root = path.resolve(DOCUMENTS_DIR) + path.sep;
  return resolved.startsWith(root) ? resolved : null;
}

/** Renvoie le chemin du fichier s'il existe, sinon lève. */
export function requireExistingPdf(stored: string | null): string {
  const filePath = resolveDocumentPath(stored);
  if (!filePath || !fs.existsSync(filePath)) {
    throw new NotFoundException('Fichier PDF introuvable');
  }
  return filePath;
}

function sanitize(ref: string) {
  return ref.replace(/[^A-Za-z0-9_-]/g, '_');
}

function addressLines(party: PartyPdfData): string[] {
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
