import { money } from '../../lib/format';
import type { VatBreakdownEntry } from '../../lib/types';

/**
 * Pied de document : HT, détail de TVA par taux, TTC, et le cas échéant le
 * reste à payer. Même présentation partout, du devis à la facture.
 */
export function DocumentTotals({
  totalHT,
  totalVat,
  totalTTC,
  vatBreakdown,
  paidAmount,
  remainingAmount,
  currency = 'EUR',
  compact = false,
}: {
  totalHT: number;
  totalVat: number;
  totalTTC: number;
  vatBreakdown?: VatBreakdownEntry[];
  paidAmount?: number;
  remainingAmount?: number;
  /** Devise du document ; les montants y sont exprimés. */
  currency?: string;
  compact?: boolean;
}) {
  const rows = vatBreakdown?.length
    ? vatBreakdown.map((entry) => ({
        label: `TVA ${formatRate(entry.rate)} %`,
        value: money(entry.amount, true, currency),
      }))
    : [{ label: 'TVA', value: money(totalVat, true, currency) }];

  return (
    <dl className={compact ? 'w-full text-[13px]' : 'w-full max-w-xs text-sm'}>
      <Row label="Total HT" value={money(totalHT, true, currency)} />
      {rows.map((row) => (
        <Row key={row.label} label={row.label} value={row.value} muted />
      ))}
      <Row label="Total TTC" value={money(totalTTC, true, currency)} strong />

      {paidAmount !== undefined && paidAmount > 0 && (
        <>
          <Row label="Déjà réglé" value={money(paidAmount, true, currency)} muted />
          <Row
            label="Reste à payer"
            value={money(remainingAmount ?? totalTTC - paidAmount, true, currency)}
            strong
          />
        </>
      )}
    </dl>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={
        'flex items-baseline justify-between gap-4 py-1 ' +
        (strong ? 'border-t border-line pt-1.5 mt-1' : '')
      }
    >
      <dt className={muted ? 'text-ink-3' : strong ? 'font-medium text-ink' : 'text-ink-2'}>
        {label}
      </dt>
      <dd
        className={
          'tabular-nums ' +
          (strong ? 'text-base font-semibold text-ink' : muted ? 'text-ink-3' : 'text-ink-2')
        }
      >
        {value}
      </dd>
    </div>
  );
}

function formatRate(rate: number) {
  return Number.isInteger(rate) ? String(rate) : rate.toFixed(1);
}
