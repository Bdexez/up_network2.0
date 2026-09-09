import { round2 } from 'src/common/documents/totals';

/**
 * Totaux d'une note de frais.
 *
 * Les lignes de frais ne passent pas par `computeLineTotals` : il n'y a ni
 * quantité ni remise, seulement un montant HT saisi tel qu'il figure sur le
 * justificatif. Le calcul reste néanmoins isolé et pur, comme celui des
 * documents de vente.
 */

export interface PricedExpenseLine {
  amountHT: number;
  vatRate?: number | null;
}

export interface ExpenseLineTotals {
  amountHT: number;
  amountVat: number;
  amountTTC: number;
}

export interface ExpenseReportTotals {
  totalHT: number;
  totalVat: number;
  totalTTC: number;
}

export function computeExpenseLine(line: PricedExpenseLine): ExpenseLineTotals {
  const amountHT = round2(line.amountHT);
  const vatRate = Math.max(line.vatRate ?? 0, 0);
  const amountVat = round2((amountHT * vatRate) / 100);

  return { amountHT, amountVat, amountTTC: round2(amountHT + amountVat) };
}

/**
 * Somme des lignes déjà calculées. On additionne les montants arrondis plutôt
 * que d'arrondir la somme : c'est le total que l'employé lira sur son relevé,
 * ligne à ligne.
 */
export function sumExpenseLines(
  lines: ExpenseLineTotals[],
): ExpenseReportTotals {
  let totalHT = 0;
  let totalVat = 0;

  for (const line of lines) {
    totalHT = round2(totalHT + line.amountHT);
    totalVat = round2(totalVat + line.amountVat);
  }

  return { totalHT, totalVat, totalTTC: round2(totalHT + totalVat) };
}
