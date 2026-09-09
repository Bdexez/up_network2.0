import { round2 } from 'src/common/documents/totals';

export interface TimeEntrySummary {
  hours: number;
  billable: boolean;
  invoicedHours: number;
}

export interface ProjectMetrics {
  totalHours: number;
  billableHours: number;
  invoicedHours: number;
  /** Heures facturables déjà consommées mais pas encore facturées. */
  pendingHours: number;
  /** Valeur des heures facturables non encore facturées. */
  pendingAmount: number;
  budgetHours: number;
  /** Part du budget consommée, en pourcentage ; null si pas de budget. */
  budgetUsedPercent: number | null;
  overBudget: boolean;
}

/**
 * Avancement d'un projet à partir de ses temps saisis.
 *
 * Isolé et pur : c'est le calcul qu'on veut pouvoir vérifier sans base, et
 * qui sert à la fois à la fiche projet et à la facturation du temps.
 */
export function computeProjectMetrics(
  entries: TimeEntrySummary[],
  options: { budgetHours: number; hourlyRate: number },
): ProjectMetrics {
  let totalHours = 0;
  let billableHours = 0;
  let invoicedHours = 0;

  for (const entry of entries) {
    totalHours = round2(totalHours + entry.hours);
    if (entry.billable) {
      billableHours = round2(billableHours + entry.hours);
      invoicedHours = round2(invoicedHours + entry.invoicedHours);
    }
  }

  const pendingHours = round2(Math.max(billableHours - invoicedHours, 0));
  const budgetHours = options.budgetHours;

  return {
    totalHours,
    billableHours,
    invoicedHours,
    pendingHours,
    pendingAmount: round2(pendingHours * options.hourlyRate),
    budgetHours,
    // Un budget à zéro veut dire « non suivi », pas « dépassé dès la
    // première heure » : on ne calcule pas de pourcentage dans ce cas.
    budgetUsedPercent:
      budgetHours > 0 ? round2((totalHours / budgetHours) * 100) : null,
    overBudget: budgetHours > 0 && totalHours > budgetHours,
  };
}
