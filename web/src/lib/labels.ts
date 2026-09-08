import type {
  ActivityStatus,
  ActivityType,
  LeadStatus,
  OpportunityStage,
  PartnerType,
} from './types';

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: 'Nouvelle',
  CONTACTED: 'Contactée',
  QUALIFIED: 'Qualifiée',
  UNQUALIFIED: 'Non qualifiée',
  CONVERTED: 'Convertie',
};

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'UNQUALIFIED',
  'CONVERTED',
];

export const STAGE_LABEL: Record<OpportunityStage, string> = {
  QUALIFICATION: 'Qualification',
  PROPOSAL: 'Proposition',
  NEGOTIATION: 'Négociation',
  WON: 'Gagnée',
  LOST: 'Perdue',
};

export const STAGE_ORDER: OpportunityStage[] = [
  'QUALIFICATION',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
];

/**
 * Les trois étapes ouvertes suivent une rampe ordinale d'une seule teinte
 * (l'avancement est une magnitude) ; gagné/perdu prennent les couleurs de
 * statut, qui ne sont jamais réutilisées pour une série.
 */
export const STAGE_COLOR: Record<OpportunityStage, string> = {
  QUALIFICATION: 'var(--stage-1)',
  PROPOSAL: 'var(--stage-2)',
  NEGOTIATION: 'var(--stage-3)',
  WON: 'var(--good)',
  LOST: 'var(--critical)',
};

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  CALL: 'Appel',
  MEETING: 'Réunion',
  EMAIL: 'E-mail',
  TASK: 'Tâche',
  NOTE: 'Note',
};

export const ACTIVITY_STATUS_LABEL: Record<ActivityStatus, string> = {
  PLANNED: 'À faire',
  DONE: 'Terminée',
  CANCELLED: 'Annulée',
};

export const PARTNER_TYPE_LABEL: Record<PartnerType, string> = {
  CUSTOMER: 'Client',
  SUPPLIER: 'Fournisseur',
  BOTH: 'Client & fournisseur',
};
