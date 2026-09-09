/**
 * Conditions de règlement : le délai du tiers prime sur celui de la société.
 * Isolé ici pour que factures et rapports appliquent la même règle.
 */
export function resolvePaymentTermsDays(
  partnerTerms: number | null | undefined,
  companyTerms: number,
): number {
  // 0 est une valeur légitime (« paiement comptant ») : on teste la nullité,
  // pas la véracité.
  return partnerTerms ?? companyTerms;
}

/** Échéance calculée depuis la date de facture et le délai applicable. */
export function computeDueDate(issuedAt: Date, termsDays: number): Date {
  const dueDate = new Date(issuedAt);
  dueDate.setDate(dueDate.getDate() + Math.max(termsDays, 0));
  return dueDate;
}
