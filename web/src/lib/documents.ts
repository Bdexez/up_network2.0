import type {
  InvoiceStatus,
  OrderStatus,
  PaymentMethod,
  ProductType,
  PurchaseOrderStatus,
  QuoteStatus,
  StockMovementType,
} from './types';

/** Teintes disponibles sur le composant Badge. */
export type Tone = 'neutral' | 'accent' | 'good' | 'warning' | 'serious' | 'critical';

export interface StatusMeta {
  label: string;
  tone: Tone;
}

/**
 * Description d'un cycle de vie côté interface : libellés, teintes et
 * transitions proposées. Les transitions dupliquent volontairement celles du
 * backend — l'API reste seule juge, l'interface se contente de ne montrer que
 * les boutons qui ont une chance d'aboutir.
 */
export interface StatusFlow<S extends string> {
  order: S[];
  meta: Record<S, StatusMeta>;
  transitions: Partial<Record<S, S[]>>;
  /** Statuts dans lesquels le document reste modifiable. */
  editable: S[];
}

export const QUOTE_FLOW: StatusFlow<QuoteStatus> = {
  order: ['DRAFT', 'VALIDATED', 'SIGNED', 'REFUSED', 'BILLED'],
  meta: {
    DRAFT: { label: 'Brouillon', tone: 'neutral' },
    VALIDATED: { label: 'Validé', tone: 'accent' },
    SIGNED: { label: 'Signé', tone: 'good' },
    REFUSED: { label: 'Refusé', tone: 'critical' },
    BILLED: { label: 'Converti', tone: 'neutral' },
  },
  transitions: {
    DRAFT: ['VALIDATED'],
    VALIDATED: ['SIGNED', 'REFUSED', 'DRAFT'],
    SIGNED: ['REFUSED'],
    REFUSED: ['VALIDATED'],
  },
  editable: ['DRAFT'],
};

export const ORDER_FLOW: StatusFlow<OrderStatus> = {
  order: ['DRAFT', 'VALIDATED', 'SHIPPED', 'BILLED', 'CANCELLED'],
  meta: {
    DRAFT: { label: 'Brouillon', tone: 'neutral' },
    VALIDATED: { label: 'Validée', tone: 'accent' },
    SHIPPED: { label: 'Expédiée', tone: 'warning' },
    BILLED: { label: 'Facturée', tone: 'good' },
    CANCELLED: { label: 'Annulée', tone: 'critical' },
  },
  // « Expédiée » est absent : l'expédition passe par son propre bouton, qui
  // sort aussi le stock.
  transitions: {
    DRAFT: ['VALIDATED', 'CANCELLED'],
    VALIDATED: ['DRAFT', 'CANCELLED'],
    CANCELLED: ['DRAFT'],
  },
  editable: ['DRAFT'],
};

export const INVOICE_FLOW: StatusFlow<InvoiceStatus> = {
  order: ['DRAFT', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'],
  meta: {
    DRAFT: { label: 'Brouillon', tone: 'neutral' },
    UNPAID: { label: 'Impayée', tone: 'serious' },
    PARTIALLY_PAID: { label: 'Partielle', tone: 'warning' },
    PAID: { label: 'Réglée', tone: 'good' },
    CANCELLED: { label: 'Annulée', tone: 'critical' },
  },
  // Les statuts de règlement découlent des paiements, ils ne se choisissent pas.
  transitions: {
    DRAFT: ['UNPAID', 'CANCELLED'],
    UNPAID: ['DRAFT', 'CANCELLED'],
    PARTIALLY_PAID: ['CANCELLED'],
    CANCELLED: ['DRAFT'],
  },
  editable: ['DRAFT'],
};

export const PURCHASE_FLOW: StatusFlow<PurchaseOrderStatus> = {
  order: ['DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED'],
  meta: {
    DRAFT: { label: 'Brouillon', tone: 'neutral' },
    ORDERED: { label: 'Commandée', tone: 'accent' },
    RECEIVED: { label: 'Réceptionnée', tone: 'good' },
    CANCELLED: { label: 'Annulée', tone: 'critical' },
  },
  // « Réceptionnée » passe par son propre bouton, qui entre aussi le stock.
  transitions: {
    DRAFT: ['ORDERED', 'CANCELLED'],
    ORDERED: ['DRAFT', 'CANCELLED'],
    CANCELLED: ['DRAFT'],
  },
  editable: ['DRAFT'],
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  TRANSFER: 'Virement',
  CARD: 'Carte bancaire',
  CHECK: 'Chèque',
  CASH: 'Espèces',
  DIRECT_DEBIT: 'Prélèvement',
  OTHER: 'Autre',
};

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  PRODUCT: 'Produit',
  SERVICE: 'Service',
};

export const MOVEMENT_TYPE_LABEL: Record<StockMovementType, string> = {
  IN: 'Entrée',
  OUT: 'Sortie',
  ADJUSTMENT: 'Ajustement',
  TRANSFER: 'Transfert',
};

export const MOVEMENT_TYPE_TONE: Record<StockMovementType, Tone> = {
  IN: 'good',
  OUT: 'serious',
  ADJUSTMENT: 'warning',
  TRANSFER: 'accent',
};
