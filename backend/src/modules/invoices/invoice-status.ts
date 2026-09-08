import { InvoiceStatus } from '@prisma/client';
import type { TransitionMap } from 'src/common/documents/workflow';

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: 'Brouillon',
  UNPAID: 'Impayée',
  PARTIALLY_PAID: 'Partiellement réglée',
  PAID: 'Réglée',
  CANCELLED: 'Annulée',
};

/**
 * brouillon → impayée (validation) → partiellement réglée → réglée.
 * Les trois derniers statuts ne sont pas pilotés à la main : ils découlent des
 * paiements enregistrés (voir PaymentsService.refreshInvoiceStatus).
 */
export const INVOICE_TRANSITIONS: TransitionMap<InvoiceStatus> = {
  DRAFT: [InvoiceStatus.UNPAID, InvoiceStatus.CANCELLED],
  UNPAID: [InvoiceStatus.DRAFT, InvoiceStatus.CANCELLED],
  PARTIALLY_PAID: [InvoiceStatus.CANCELLED],
  CANCELLED: [InvoiceStatus.DRAFT],
};

export const INVOICE_EDITABLE: readonly InvoiceStatus[] = [InvoiceStatus.DRAFT];
