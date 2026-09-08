import { QuoteStatus } from '@prisma/client';
import type { TransitionMap } from 'src/common/documents/workflow';

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  DRAFT: 'Brouillon',
  VALIDATED: 'Validé',
  SIGNED: 'Signé',
  REFUSED: 'Refusé',
  BILLED: 'Converti en commande',
};

/**
 * Cycle de vie d'un devis :
 * brouillon → validé → signé (puis converti) ou refusé.
 * Un devis validé peut revenir en brouillon tant qu'il n'est pas signé.
 */
export const QUOTE_TRANSITIONS: TransitionMap<QuoteStatus> = {
  DRAFT: [QuoteStatus.VALIDATED],
  VALIDATED: [QuoteStatus.SIGNED, QuoteStatus.REFUSED, QuoteStatus.DRAFT],
  SIGNED: [QuoteStatus.BILLED, QuoteStatus.REFUSED],
  REFUSED: [QuoteStatus.VALIDATED],
};

/** Statuts dans lesquels les lignes et les montants restent modifiables. */
export const QUOTE_EDITABLE: readonly QuoteStatus[] = [QuoteStatus.DRAFT];
