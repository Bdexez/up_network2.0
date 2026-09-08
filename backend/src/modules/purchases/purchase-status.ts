import { PurchaseOrderStatus } from '@prisma/client';
import type { TransitionMap } from 'src/common/documents/workflow';

export const PURCHASE_STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  DRAFT: 'Brouillon',
  ORDERED: 'Commandée',
  RECEIVED: 'Réceptionnée',
  CANCELLED: 'Annulée',
};

/**
 * brouillon → commandée → réceptionnée.
 * La réception entre le stock ; comme pour l'expédition, pas de retour arrière
 * automatique depuis « réceptionnée ».
 */
export const PURCHASE_TRANSITIONS: TransitionMap<PurchaseOrderStatus> = {
  DRAFT: [PurchaseOrderStatus.ORDERED, PurchaseOrderStatus.CANCELLED],
  ORDERED: [
    PurchaseOrderStatus.RECEIVED,
    PurchaseOrderStatus.DRAFT,
    PurchaseOrderStatus.CANCELLED,
  ],
  CANCELLED: [PurchaseOrderStatus.DRAFT],
};

export const PURCHASE_EDITABLE: readonly PurchaseOrderStatus[] = [
  PurchaseOrderStatus.DRAFT,
];
