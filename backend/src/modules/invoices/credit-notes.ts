import { InvoiceStatus } from '@prisma/client';
import { round2 } from 'src/common/documents/totals';

/** Ce qu'il faut d'un avoir pour savoir ce qu'il a déjà corrigé. */
export interface IssuedCreditNote {
  status: InvoiceStatus;
  totalTTC: number;
}

/**
 * Montant encore avoirable sur une facture.
 *
 * Le plafond porte sur le cumul : sans lui, deux avoirs pleins passeraient
 * l'un après l'autre et la créance deviendrait négative. Un avoir annulé ne
 * corrige plus rien, il sort du décompte.
 */
export function creditableAmount(
  invoiceTotalTTC: number,
  issued: IssuedCreditNote[],
): number {
  const credited = issued
    .filter((note) => note.status !== InvoiceStatus.CANCELLED)
    .reduce((sum, note) => round2(sum + note.totalTTC), 0);

  return round2(invoiceTotalTTC - credited);
}
