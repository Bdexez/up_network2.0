import { round2 } from 'src/common/documents/totals';

/**
 * Tranches d'antériorité de la balance âgée, en jours de retard.
 * `Infinity` ferme la dernière tranche : tout ce qui dépasse 90 jours.
 */
export const AGING_BUCKETS = [
  { key: 'notDue', label: 'Non échu', from: -Infinity, to: 0 },
  { key: 'days1to30', label: '1 à 30 j', from: 1, to: 30 },
  { key: 'days31to60', label: '31 à 60 j', from: 31, to: 60 },
  { key: 'days61to90', label: '61 à 90 j', from: 61, to: 90 },
  { key: 'over90', label: 'Plus de 90 j', from: 91, to: Infinity },
] as const;

export type AgingBucketKey = (typeof AGING_BUCKETS)[number]['key'];

/**
 * Jours de retard : négatif ou nul tant que l'échéance n'est pas passée.
 *
 * Le découpage se fait en jours UTC. Mélanger getters locaux et `Date.UTC`
 * décalerait d'un jour toute échéance tombant en soirée, et une facture
 * changerait de tranche selon le fuseau du serveur.
 */
export function daysOverdue(dueDate: Date | null, reference: Date): number {
  if (!dueDate) return 0;

  const startOfUtcDay = (date: Date) =>
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  return Math.round(
    (startOfUtcDay(reference) - startOfUtcDay(dueDate)) / 86_400_000,
  );
}

export function bucketFor(days: number): AgingBucketKey {
  const bucket = AGING_BUCKETS.find(
    (candidate) => days >= candidate.from && days <= candidate.to,
  );
  // La liste couvre tout l'intervalle ; le repli protège d'une évolution ratée.
  return bucket?.key ?? 'notDue';
}

export interface AgingRow {
  partnerId: number;
  partnerName: string;
  total: number;
  buckets: Record<AgingBucketKey, number>;
}

interface OpenInvoice {
  partnerId: number;
  partnerName: string;
  dueDate: Date | null;
  /** Reste dû, déjà converti en devise société. */
  remaining: number;
}

/**
 * Balance âgée : ce que chaque client doit, ventilé par ancienneté du retard.
 * C'est l'état qu'on regarde avant de lancer une campagne de relance.
 */
export function buildAgingReport(
  invoices: OpenInvoice[],
  reference: Date = new Date(),
): { rows: AgingRow[]; totals: Record<AgingBucketKey, number>; total: number } {
  const emptyBuckets = () =>
    Object.fromEntries(AGING_BUCKETS.map((b) => [b.key, 0])) as Record<
      AgingBucketKey,
      number
    >;

  const byPartner = new Map<number, AgingRow>();
  const totals = emptyBuckets();

  for (const invoice of invoices) {
    const row =
      byPartner.get(invoice.partnerId) ??
      ({
        partnerId: invoice.partnerId,
        partnerName: invoice.partnerName,
        total: 0,
        buckets: emptyBuckets(),
      } satisfies AgingRow);

    const key = bucketFor(daysOverdue(invoice.dueDate, reference));
    row.buckets[key] = round2(row.buckets[key] + invoice.remaining);
    row.total = round2(row.total + invoice.remaining);
    totals[key] = round2(totals[key] + invoice.remaining);

    byPartner.set(invoice.partnerId, row);
  }

  const rows = [...byPartner.values()].sort((a, b) => b.total - a.total);
  const total = round2(rows.reduce((acc, row) => acc + row.total, 0));

  return { rows, totals, total };
}
