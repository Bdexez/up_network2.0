/**
 * Tranches de la balance âgée, alignées sur
 * backend/src/modules/reports/aging.ts.
 */
export const AGING_BUCKETS = [
  { key: 'notDue', label: 'Non échu' },
  { key: 'days1to30', label: '1 à 30 j' },
  { key: 'days31to60', label: '31 à 60 j' },
  { key: 'days61to90', label: '61 à 90 j' },
  { key: 'over90', label: '+ de 90 j' },
] as const;

/** Une tranche d'autant plus alarmante qu'elle est ancienne. */
export const BUCKET_TONE: Record<string, 'neutral' | 'warning' | 'serious' | 'critical'> = {
  notDue: 'neutral',
  days1to30: 'neutral',
  days31to60: 'warning',
  days61to90: 'serious',
  over90: 'critical',
};
