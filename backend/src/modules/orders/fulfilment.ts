import { BadRequestException } from '@nestjs/common';
import { round2 } from 'src/common/documents/totals';

/** Ce qu'il faut d'une ligne pour raisonner sur son avancement. */
export interface FulfilableLine {
  id: number;
  label: string;
  quantity: number;
  shippedQuantity: number;
  invoicedQuantity: number;
}

export type Dimension = 'shipped' | 'invoiced';

const REMAINING: Record<Dimension, (line: FulfilableLine) => number> = {
  shipped: (line) => round2(line.quantity - line.shippedQuantity),
  invoiced: (line) => round2(line.quantity - line.invoicedQuantity),
};

/*
 * Les fonctions ci-dessous sont génériques sur `L extends FulfilableLine` :
 * elles n'ont besoin que des champs d'avancement, mais rendent la ligne
 * complète à l'appelant, qui y retrouve prix, TVA et produit.
 */

const WORD: Record<Dimension, string> = {
  shipped: 'expédier',
  invoiced: 'facturer',
};

/** Reste à expédier / à facturer sur une ligne. */
export function remainingOn(
  line: FulfilableLine,
  dimension: Dimension,
): number {
  return REMAINING[dimension](line);
}

/** Vrai quand plus rien n'est à traiter sur l'ensemble des lignes. */
export function isFullyFulfilled(
  lines: FulfilableLine[],
  dimension: Dimension,
): boolean {
  return lines.every((line) => remainingOn(line, dimension) <= 0);
}

/**
 * Résout les quantités demandées en quantités réellement traitables.
 *
 * Sans sélection, on prend tout le reliquat. Avec sélection, on vérifie que
 * chaque ligne appartient bien à la commande et que la quantité ne dépasse pas
 * ce qui reste — c'est le seul endroit où cette règle est écrite.
 */
export function resolveFulfilment<L extends FulfilableLine>(
  lines: L[],
  dimension: Dimension,
  requested?: { lineId: number; quantity: number }[],
): { line: L; quantity: number }[] {
  if (!requested) {
    return lines
      .map((line) => ({ line, quantity: remainingOn(line, dimension) }))
      .filter((entry) => entry.quantity > 0);
  }

  const byId = new Map(lines.map((line) => [line.id, line]));

  const resolved = requested.map(({ lineId, quantity }) => {
    const line = byId.get(lineId);
    if (!line) {
      throw new BadRequestException(
        `La ligne ${lineId} n'appartient pas à cette commande`,
      );
    }

    const remaining = remainingOn(line, dimension);
    if (quantity > remaining) {
      throw new BadRequestException(
        `« ${line.label} » : ${quantity} à ${WORD[dimension]} pour un reliquat de ${remaining}`,
      );
    }

    return { line, quantity: round2(quantity) };
  });

  const kept = resolved.filter((entry) => entry.quantity > 0);
  if (kept.length === 0) {
    throw new BadRequestException(`Aucune quantité à ${WORD[dimension]}`);
  }
  return kept;
}
