import type {
  ExpenseCategory,
  ExpenseStatus,
  InvoiceStatus,
  LeaveStatus,
  LeaveType,
  OrderStatus,
  PartnerType,
  PaymentMethod,
  ProjectStatus,
  ProductType,
  PurchaseOrderStatus,
  QuoteStatus,
  StockMovementType,
  TaskStatus,
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

export const PROJECT_FLOW: StatusFlow<ProjectStatus> = {
  order: ['DRAFT', 'ACTIVE', 'ON_HOLD', 'CLOSED'],
  meta: {
    DRAFT: { label: 'Brouillon', tone: 'neutral' },
    ACTIVE: { label: 'En cours', tone: 'accent' },
    ON_HOLD: { label: 'En pause', tone: 'warning' },
    CLOSED: { label: 'Clôturé', tone: 'good' },
  },
  transitions: {
    DRAFT: ['ACTIVE'],
    ACTIVE: ['ON_HOLD', 'CLOSED'],
    ON_HOLD: ['ACTIVE', 'CLOSED'],
    CLOSED: ['ACTIVE'],
  },
  editable: ['DRAFT', 'ACTIVE', 'ON_HOLD'],
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminée',
  CANCELLED: 'Annulée',
};

export const TASK_STATUS_TONE: Record<TaskStatus, Tone> = {
  TODO: 'neutral',
  IN_PROGRESS: 'accent',
  DONE: 'good',
  CANCELLED: 'critical',
};

export const LEAVE_FLOW: StatusFlow<LeaveStatus> = {
  order: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
  meta: {
    PENDING: { label: 'En attente', tone: 'warning' },
    APPROVED: { label: 'Approuvée', tone: 'good' },
    REJECTED: { label: 'Refusée', tone: 'critical' },
    CANCELLED: { label: 'Annulée', tone: 'neutral' },
  },
  transitions: {
    PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
    APPROVED: ['CANCELLED'],
  },
  // Une demande n'a pas de lignes : seule la période reste « modifiable »,
  // et uniquement tant qu'aucune décision n'est prise.
  editable: ['PENDING'],
};

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  PAID: 'Congés payés',
  RTT: 'RTT',
  SICK: 'Arrêt maladie',
  UNPAID: 'Congé sans solde',
  OTHER: 'Autre absence',
};

export const LEAVE_TYPE_TONE: Record<LeaveType, Tone> = {
  PAID: 'accent',
  RTT: 'neutral',
  SICK: 'serious',
  UNPAID: 'warning',
  OTHER: 'neutral',
};

export const EXPENSE_FLOW: StatusFlow<ExpenseStatus> = {
  order: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REFUSED', 'REIMBURSED'],
  meta: {
    DRAFT: { label: 'Brouillon', tone: 'neutral' },
    SUBMITTED: { label: 'Soumise', tone: 'accent' },
    APPROVED: { label: 'Approuvée', tone: 'good' },
    REFUSED: { label: 'Refusée', tone: 'critical' },
    REIMBURSED: { label: 'Remboursée', tone: 'good' },
  },
  transitions: {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['APPROVED', 'REFUSED', 'DRAFT'],
    APPROVED: ['REIMBURSED', 'REFUSED'],
    REFUSED: ['DRAFT'],
  },
  editable: ['DRAFT'],
};

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  TRAVEL: 'Transport',
  MEAL: 'Repas',
  ACCOMMODATION: 'Hébergement',
  SUPPLIES: 'Fournitures',
  MILEAGE: 'Frais kilométriques',
  OTHER: 'Divers',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  TRANSFER: 'Virement',
  CARD: 'Carte bancaire',
  CHECK: 'Chèque',
  CASH: 'Espèces',
  DIRECT_DEBIT: 'Prélèvement',
  OTHER: 'Autre',
};

export const PARTNER_TYPE_LABEL_MAP: Record<PartnerType, string> = {
  CUSTOMER: 'Client',
  SUPPLIER: 'Fournisseur',
  BOTH: 'Client & fournisseur',
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
