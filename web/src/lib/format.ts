const numberFormatter = new Intl.NumberFormat('fr-FR');

/**
 * Les formateurs Intl sont coûteux à créer : on les mémorise par devise et
 * précision plutôt que d'en instancier un à chaque cellule de tableau.
 */
const formatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currency: string, precise: boolean) {
  const key = `${currency}:${precise}`;
  let formatter = formatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: precise ? 2 : 0,
      maximumFractionDigits: precise ? 2 : 0,
    });
    formatters.set(key, formatter);
  }

  return formatter;
}

/**
 * Montant formaté. La devise par défaut est l'euro ; les documents libellés
 * dans une autre devise passent la leur pour que le symbole soit juste.
 */
export function money(
  value: number | null | undefined,
  precise = false,
  currency = 'EUR',
) {
  return currencyFormatter(currency, precise).format(value ?? 0);
}

export function count(value: number | null | undefined) {
  return numberFormatter.format(value ?? 0);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** « dans 3 jours », « il y a 2 mois »… pour les échéances. */
export function relativeDate(value: string | null | undefined) {
  if (!value) return '—';
  const target = new Date(value);
  const today = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round(
    (startOfDay(target).getTime() - startOfDay(today).getTime()) / 86_400_000,
  );

  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'demain';
  if (days === -1) return 'hier';

  const rtf = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });
  if (Math.abs(days) < 31) return rtf.format(days, 'day');
  return rtf.format(Math.round(days / 30), 'month');
}

/** « 2026-04 » -> « avr. 2026 » pour l'axe des graphiques. */
export function monthLabel(value: string) {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, 1).toLocaleDateString('fr-FR', {
    month: 'short',
    year: '2-digit',
  });
}

export function initials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Abrège les montants sur les axes : 12 400 -> « 12,4 k€ ». */
export function compactMoney(value: number) {
  if (Math.abs(value) >= 1000) {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value / 1000)} k€`;
  }
  return `${numberFormatter.format(value)} €`;
}
