import {
  ExpenseCategory,
  ExpenseStatus,
  LeaveStatus,
  LeaveType,
} from '@prisma/client';
import type { TransitionMap } from 'src/common/documents/workflow';

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  PAID: 'Congés payés',
  RTT: 'RTT',
  SICK: 'Arrêt maladie',
  UNPAID: 'Congé sans solde',
  OTHER: 'Autre absence',
};

export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Refusée',
  CANCELLED: 'Annulée',
};

/**
 * Une demande approuvée reste annulable : l'employé qui renonce à ses congés
 * récupère les jours décomptés. Un refus, lui, est définitif — il faut
 * déposer une nouvelle demande.
 */
export const LEAVE_TRANSITIONS: TransitionMap<LeaveStatus> = {
  PENDING: [LeaveStatus.APPROVED, LeaveStatus.REJECTED, LeaveStatus.CANCELLED],
  APPROVED: [LeaveStatus.CANCELLED],
};

export const EXPENSE_STATUS_LABEL: Record<ExpenseStatus, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumise',
  APPROVED: 'Approuvée',
  REFUSED: 'Refusée',
  REIMBURSED: 'Remboursée',
};

/** Une note refusée repart en brouillon : on corrige, on resoumet. */
export const EXPENSE_TRANSITIONS: TransitionMap<ExpenseStatus> = {
  DRAFT: [ExpenseStatus.SUBMITTED],
  SUBMITTED: [
    ExpenseStatus.APPROVED,
    ExpenseStatus.REFUSED,
    ExpenseStatus.DRAFT,
  ],
  APPROVED: [ExpenseStatus.REIMBURSED, ExpenseStatus.REFUSED],
  REFUSED: [ExpenseStatus.DRAFT],
};

/** Au-delà du brouillon, les lignes et les montants sont figés. */
export const EXPENSE_EDITABLE: readonly ExpenseStatus[] = [ExpenseStatus.DRAFT];

/** Statuts qui engagent une décision d'un responsable. */
export const EXPENSE_DECISIONS: readonly ExpenseStatus[] = [
  ExpenseStatus.APPROVED,
  ExpenseStatus.REFUSED,
  ExpenseStatus.REIMBURSED,
];

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  TRAVEL: 'Transport',
  MEAL: 'Repas',
  ACCOMMODATION: 'Hébergement',
  SUPPLIES: 'Fournitures',
  MILEAGE: 'Frais kilométriques',
  OTHER: 'Divers',
};
