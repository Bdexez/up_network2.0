import { Plus, Trash2 } from 'lucide-react';
import { money } from '../../lib/format';
import type { ProductOption } from '../../lib/types';
import { Button } from '../ui/Button';
import { DocumentTotals } from './DocumentTotals';

/** Une ligne en cours de saisie : tout est texte, la conversion se fait à l'envoi. */
export interface DraftLine {
  productId: string;
  label: string;
  quantity: string;
  unitPrice: string;
  discountPercent: string;
  vatRate: string;
}

export const EMPTY_LINE: DraftLine = {
  productId: '',
  label: '',
  quantity: '1',
  unitPrice: '',
  discountPercent: '0',
  vatRate: '20',
};

/**
 * Éditeur de lignes commun aux devis, commandes, factures et commandes
 * fournisseur. Les totaux affichés reprennent la même formule que le serveur,
 * qui reste la source de vérité au moment de l'enregistrement.
 */
export function LineEditor({
  lines,
  products,
  onChange,
  /** Les achats se valorisent au prix d'achat, les ventes au prix de vente. */
  useCostPrice = false,
}: {
  lines: DraftLine[];
  products: ProductOption[];
  onChange: (lines: DraftLine[]) => void;
  useCostPrice?: boolean;
}) {
  const update = (index: number, patch: Partial<DraftLine>) =>
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  /** Choisir un produit préremplit libellé, prix et TVA — modifiables ensuite. */
  const pickProduct = (index: number, productId: string) => {
    const product = products.find((p) => String(p.id) === productId);
    update(index, {
      productId,
      label: product?.name ?? lines[index].label,
      unitPrice: product
        ? String(useCostPrice ? product.costPrice : product.price)
        : lines[index].unitPrice,
      vatRate: product ? String(product.vatRate) : lines[index].vatRate,
    });
  };

  const totals = computeTotals(lines);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-ink-3">
              <th className="pb-1.5 text-left font-semibold">Désignation</th>
              <th className="w-20 pb-1.5 text-right font-semibold">Qté</th>
              <th className="w-28 pb-1.5 text-right font-semibold">P.U. HT</th>
              <th className="w-20 pb-1.5 text-right font-semibold">Rem. %</th>
              <th className="w-20 pb-1.5 text-right font-semibold">TVA %</th>
              <th className="w-28 pb-1.5 text-right font-semibold">Total HT</th>
              <th className="w-9" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="align-top">
                <td className="py-1 pr-2">
                  <select
                    aria-label={`Produit ligne ${index + 1}`}
                    value={line.productId}
                    onChange={(event) => pickProduct(index, event.target.value)}
                    className="h-9 w-full rounded-lg border border-line bg-raised px-2 text-sm text-ink hover:border-line-strong focus:border-accent"
                  >
                    <option value="">Ligne libre…</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {!line.productId && (
                    <input
                      aria-label={`Libellé ligne ${index + 1}`}
                      value={line.label}
                      onChange={(event) => update(index, { label: event.target.value })}
                      placeholder="Libellé de la ligne"
                      className="mt-1 h-9 w-full rounded-lg border border-line bg-raised px-2 text-sm text-ink placeholder:text-ink-3 hover:border-line-strong focus:border-accent"
                    />
                  )}
                </td>
                <NumberCell
                  label={`Quantité ligne ${index + 1}`}
                  value={line.quantity}
                  min="0"
                  step="0.01"
                  onChange={(value) => update(index, { quantity: value })}
                />
                <NumberCell
                  label={`Prix unitaire ligne ${index + 1}`}
                  value={line.unitPrice}
                  min="0"
                  step="0.01"
                  onChange={(value) => update(index, { unitPrice: value })}
                />
                <NumberCell
                  label={`Remise ligne ${index + 1}`}
                  value={line.discountPercent}
                  min="0"
                  max="100"
                  step="0.1"
                  onChange={(value) => update(index, { discountPercent: value })}
                />
                <NumberCell
                  label={`TVA ligne ${index + 1}`}
                  value={line.vatRate}
                  min="0"
                  step="0.1"
                  onChange={(value) => update(index, { vatRate: value })}
                />
                <td className="py-1 pl-2 text-right align-middle text-[13px] font-medium tabular-nums text-ink">
                  {money(lineTotal(line), true)}
                </td>
                <td className="py-1 pl-1 align-middle">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Supprimer la ligne ${index + 1}`}
                    disabled={lines.length === 1}
                    onClick={() => onChange(lines.filter((_, i) => i !== index))}
                    icon={<Trash2 size={14} />}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => onChange([...lines, { ...EMPTY_LINE }])}
        >
          Ajouter une ligne
        </Button>

        <div className="ml-auto w-full max-w-xs">
          <DocumentTotals {...totals} compact />
        </div>
      </div>
    </div>
  );
}

function NumberCell({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  step?: string;
  onChange: (value: string) => void;
}) {
  return (
    <td className="py-1 pl-2">
      <input
        type="number"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-line bg-raised px-2 text-right text-sm tabular-nums text-ink hover:border-line-strong focus:border-accent"
      />
    </td>
  );
}

// --- Calculs, alignés sur backend/src/common/documents/totals.ts -------------

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function lineTotal(line: DraftLine) {
  const quantity = Number(line.quantity) || 0;
  const unitPrice = Number(line.unitPrice) || 0;
  const discount = Math.min(Math.max(Number(line.discountPercent) || 0, 0), 100);
  return round2(quantity * unitPrice * (1 - discount / 100));
}

/** Agrège la TVA par taux, comme le serveur, pour éviter tout écart d'arrondi. */
export function computeTotals(lines: DraftLine[]) {
  const byRate = new Map<number, number>();
  let totalHT = 0;

  for (const line of lines) {
    const ht = lineTotal(line);
    totalHT = round2(totalHT + ht);

    const rate = Math.max(Number(line.vatRate) || 0, 0);
    byRate.set(rate, round2((byRate.get(rate) ?? 0) + round2(ht * (rate / 100))));
  }

  const vatBreakdown = [...byRate.entries()]
    .filter(([rate]) => rate > 0)
    .sort((a, b) => a[0] - b[0])
    .map(([rate, amount]) => ({ rate, base: 0, amount }));

  const totalVat = round2(vatBreakdown.reduce((acc, entry) => acc + entry.amount, 0));

  return { totalHT, totalVat, totalTTC: round2(totalHT + totalVat), vatBreakdown };
}

/** Convertit les lignes saisies en charge utile pour l'API. */
export function toLinePayload(lines: DraftLine[]) {
  return lines
    .filter((line) => Number(line.quantity) > 0 && (line.productId || line.label.trim()))
    .map((line) => ({
      productId: line.productId ? Number(line.productId) : undefined,
      label: line.productId ? undefined : line.label.trim(),
      quantity: Number(line.quantity),
      unitPrice: line.unitPrice === '' ? undefined : Number(line.unitPrice),
      discountPercent: Number(line.discountPercent) || 0,
      vatRate: line.vatRate === '' ? undefined : Number(line.vatRate),
    }));
}

/** Recharge un document existant dans l'éditeur. */
export function toDraftLines(
  lines: {
    productId: number | null;
    label: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    vatRate: number;
  }[],
): DraftLine[] {
  if (lines.length === 0) return [{ ...EMPTY_LINE }];
  return lines.map((line) => ({
    productId: line.productId ? String(line.productId) : '',
    label: line.label,
    quantity: String(line.quantity),
    unitPrice: String(line.unitPrice),
    discountPercent: String(line.discountPercent),
    vatRate: String(line.vatRate),
  }));
}
