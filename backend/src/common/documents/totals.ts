/**
 * Calcul des totaux d'un document commercial.
 *
 * Ces fonctions sont pures et sont l'unique endroit où se calculent HT, TVA et
 * TTC : devis, commandes, factures et commandes fournisseur les partagent, ce
 * qui garantit qu'une conversion ne change jamais un montant.
 */

/** Champs nécessaires pour valoriser une ligne. */
export interface PricedLine {
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  vatRate?: number;
}

export interface LineTotals {
  totalHT: number;
  totalVat: number;
  totalTTC: number;
}

export interface DocumentTotals extends LineTotals {
  /** Détail par taux, pour le pied de facture. */
  vatBreakdown: { rate: number; base: number; amount: number }[];
}

/** Arrondi comptable à deux décimales. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeLineTotals(line: PricedLine): LineTotals {
  const discount = clampPercent(line.discountPercent ?? 0);
  const vatRate = Math.max(line.vatRate ?? 0, 0);

  const gross = line.quantity * line.unitPrice;
  const totalHT = round2(gross * (1 - discount / 100));
  const totalVat = round2(totalHT * (vatRate / 100));

  return { totalHT, totalVat, totalTTC: round2(totalHT + totalVat) };
}

/**
 * Totaux d'un document. La TVA est agrégée par taux puis sommée : on évite
 * ainsi les écarts d'un centime que produirait un arrondi sur le total global.
 */
export function computeDocumentTotals(
  lines: (PricedLine & Partial<LineTotals>)[],
): DocumentTotals {
  const byRate = new Map<number, { base: number; amount: number }>();

  let totalHT = 0;
  for (const line of lines) {
    const totals = computeLineTotals(line);
    totalHT = round2(totalHT + totals.totalHT);

    const rate = Math.max(line.vatRate ?? 0, 0);
    const bucket = byRate.get(rate) ?? { base: 0, amount: 0 };
    bucket.base = round2(bucket.base + totals.totalHT);
    bucket.amount = round2(bucket.amount + totals.totalVat);
    byRate.set(rate, bucket);
  }

  const vatBreakdown = [...byRate.entries()]
    .filter(([rate]) => rate > 0)
    .sort((a, b) => a[0] - b[0])
    .map(([rate, bucket]) => ({
      rate,
      base: bucket.base,
      amount: bucket.amount,
    }));

  const totalVat = round2(
    vatBreakdown.reduce((acc, entry) => acc + entry.amount, 0),
  );

  return {
    totalHT,
    totalVat,
    totalTTC: round2(totalHT + totalVat),
    vatBreakdown,
  };
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}
