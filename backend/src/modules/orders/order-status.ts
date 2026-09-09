import { OrderStatus } from '@prisma/client';
import type { TransitionMap } from 'src/common/documents/workflow';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  DRAFT: 'Brouillon',
  VALIDATED: 'Validée',
  SHIPPED: 'Expédiée',
  BILLED: 'Facturée',
  CANCELLED: 'Annulée',
};

/**
 * brouillon → validée → expédiée → facturée.
 * L'expédition sort le stock ; le retour en arrière depuis « expédiée » n'est
 * pas proposé, il faudrait un mouvement de stock inverse explicite.
 */
export const ORDER_TRANSITIONS: TransitionMap<OrderStatus> = {
  DRAFT: [OrderStatus.VALIDATED, OrderStatus.CANCELLED],
  VALIDATED: [
    OrderStatus.SHIPPED,
    OrderStatus.BILLED,
    OrderStatus.DRAFT,
    OrderStatus.CANCELLED,
  ],
  SHIPPED: [OrderStatus.BILLED],
  CANCELLED: [OrderStatus.DRAFT],
};

export const ORDER_EDITABLE: readonly OrderStatus[] = [OrderStatus.DRAFT];

/**
 * Statuts depuis lesquels un reliquat peut encore être expédié.
 *
 * « Facturée » en fait partie : une commande réglée d'avance est facturée
 * avant d'être expédiée, et la marchandise doit malgré tout sortir du stock.
 */
export const ORDER_SHIPPABLE: readonly OrderStatus[] = [
  OrderStatus.VALIDATED,
  OrderStatus.SHIPPED,
  OrderStatus.BILLED,
];
