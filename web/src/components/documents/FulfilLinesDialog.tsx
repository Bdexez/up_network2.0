import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { money } from '../../lib/format';
import type { OrderLine } from '../../lib/types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export type FulfilDimension = 'shipped' | 'invoiced';

/**
 * Sélection des quantités à expédier ou à facturer.
 *
 * Les champs sont préremplis avec le reliquat : le cas courant — tout solder —
 * ne demande qu'une validation, le partiel se fait en ajustant une case.
 */
export function FulfilLinesDialog({
  open,
  title,
  description,
  lines,
  dimension,
  currency,
  loading,
  confirmLabel,
  extraFields,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  lines: OrderLine[];
  dimension: FulfilDimension;
  currency: string;
  loading: boolean;
  confirmLabel: string;
  extraFields?: ReactNode;
  onClose: () => void;
  onConfirm: (selection: { lineId: number; quantity: number }[]) => void;
}) {
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const remainingOf = (line: OrderLine) =>
    dimension === 'shipped'
      ? (line.remainingToShip ?? line.quantity - line.shippedQuantity)
      : (line.remainingToInvoice ?? line.quantity - line.invoicedQuantity);

  // Les lignes arrivent après l'ouverture (requête de détail) : on amorce dès
  // qu'elles sont là, et une seule fois par jeu de lignes — sinon un
  // rafraîchissement en arrière-plan écraserait la saisie en cours.
  const linesKey = lines.map((line) => line.id).join(',');
  useEffect(() => {
    if (!open || lines.length === 0) return;
    setQuantities(
      Object.fromEntries(lines.map((line) => [line.id, String(remainingOf(line))])),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, linesKey]);

  const pending = lines.filter((line) => remainingOf(line) > 0);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onConfirm(
      pending
        .map((line) => ({ lineId: line.id, quantity: Number(quantities[line.id]) || 0 }))
        .filter((entry) => entry.quantity > 0),
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      width="md"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={loading} form="fulfil-form" type="submit">
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form id="fulfil-form" onSubmit={submit} className="flex flex-col gap-4">
        {extraFields}

        {pending.length === 0 ? (
          <p className="text-[13px] text-ink-3">
            Toutes les lignes sont déjà traitées.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[30rem] text-sm">
              <thead>
                <tr className="border-b border-line bg-sunken text-[11px] uppercase tracking-wide text-ink-3">
                  <th className="px-3 py-2 text-left font-semibold">Désignation</th>
                  <th className="px-3 py-2 text-right font-semibold">Commandé</th>
                  <th className="px-3 py-2 text-right font-semibold">Reste</th>
                  <th className="w-28 px-3 py-2 text-right font-semibold">
                    {dimension === 'shipped' ? 'À expédier' : 'À facturer'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pending.map((line) => (
                  <tr key={line.id} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-2 text-ink">
                      {line.label}
                      <span className="block text-[11px] text-ink-3">
                        {money(line.unitPrice, true, currency)} / unité
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-3">
                      {line.quantity}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-2">
                      {remainingOf(line)}
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        max={remainingOf(line)}
                        step="0.01"
                        aria-label={`Quantité pour ${line.label}`}
                        value={quantities[line.id] ?? ''}
                        onChange={(event) =>
                          setQuantities((current) => ({
                            ...current,
                            [line.id]: event.target.value,
                          }))
                        }
                        className="h-9 w-full rounded-lg border border-line bg-raised px-2 text-right text-sm tabular-nums text-ink hover:border-line-strong focus:border-accent"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>
    </Modal>
  );
}
