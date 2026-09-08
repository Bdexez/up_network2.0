import { money } from '../../lib/format';
import type { DocumentLine } from '../../lib/types';

/** Tableau en lecture seule des lignes d'un document. */
export function DocumentLines({ lines }: { lines: DocumentLine[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[38rem] text-sm">
        <thead>
          <tr className="border-b border-line bg-sunken text-[11px] uppercase tracking-wide text-ink-3">
            <th className="px-3 py-2 text-left font-semibold">Désignation</th>
            <th className="px-3 py-2 text-right font-semibold">Qté</th>
            <th className="px-3 py-2 text-right font-semibold">P.U. HT</th>
            <th className="px-3 py-2 text-right font-semibold">Rem.</th>
            <th className="px-3 py-2 text-right font-semibold">TVA</th>
            <th className="px-3 py-2 text-right font-semibold">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className="border-b border-line last:border-b-0">
              <td className="px-3 py-2 text-ink">{line.label}</td>
              <td className="px-3 py-2 text-right tabular-nums text-ink-2">
                {formatNumber(line.quantity)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-ink-2">
                {money(line.unitPrice, true)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-ink-3">
                {line.discountPercent ? `${formatNumber(line.discountPercent)} %` : '—'}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-ink-3">
                {formatNumber(line.vatRate)} %
              </td>
              <td className="px-3 py-2 text-right font-medium tabular-nums text-ink">
                {money(line.totalHT, true)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
