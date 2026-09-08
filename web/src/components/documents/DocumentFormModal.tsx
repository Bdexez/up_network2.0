import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Field';
import {
  EMPTY_LINE,
  LineEditor,
  toLinePayload,
  type DraftLine,
} from './LineEditor';
import type { Partner, Product } from '../../lib/types';

export interface DocumentFormValues {
  partnerId: string;
  date: string;
  secondaryDate: string;
  notes: string;
  lines: DraftLine[];
}

const EMPTY_FORM: DocumentFormValues = {
  partnerId: '',
  date: '',
  secondaryDate: '',
  notes: '',
  lines: [{ ...EMPTY_LINE }],
};

/**
 * Formulaire commun aux quatre documents commerciaux : ils ont tous un tiers,
 * deux dates, des notes et des lignes. Ce qui diffère (libellés, liste de
 * tiers, prix de référence) passe en props.
 */
export function DocumentFormModal({
  open,
  title,
  partnerLabel,
  secondaryDateLabel,
  partners,
  products,
  initial,
  loading,
  useCostPrice = false,
  extraFields,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  partnerLabel: string;
  secondaryDateLabel: string;
  partners: Partner[];
  products: Product[];
  initial?: DocumentFormValues;
  loading: boolean;
  useCostPrice?: boolean;
  /** Champs propres au document (ex. entrepôt de réception). */
  extraFields?: ReactNode;
  onClose: () => void;
  onSubmit: (payload: {
    partnerId: number;
    date?: string;
    secondaryDate?: string;
    notes?: string;
    lines: ReturnType<typeof toLinePayload>;
  }) => void;
}) {
  const [form, setForm] = useState<DocumentFormValues>(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(initial ?? EMPTY_FORM);
    setError('');
  }, [open, initial]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.partnerId) return setError(`Choisissez un ${partnerLabel.toLowerCase()}.`);

    const lines = toLinePayload(form.lines);
    if (lines.length === 0) {
      return setError('Ajoutez au moins une ligne avec une quantité et un libellé.');
    }

    onSubmit({
      partnerId: Number(form.partnerId),
      date: form.date ? new Date(form.date).toISOString() : undefined,
      secondaryDate: form.secondaryDate
        ? new Date(form.secondaryDate).toISOString()
        : undefined,
      notes: form.notes || undefined,
      lines,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width="lg"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={loading} form="document-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="document-form" onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-3.5 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <Select
              label={partnerLabel}
              required
              value={form.partnerId}
              onChange={(event) =>
                setForm((current) => ({ ...current, partnerId: event.target.value }))
              }
            >
              <option value="">Sélectionner…</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(event) =>
              setForm((current) => ({ ...current, date: event.target.value }))
            }
          />
          <Input
            label={secondaryDateLabel}
            type="date"
            value={form.secondaryDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, secondaryDate: event.target.value }))
            }
          />
          {extraFields}
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">Lignes</p>
          <LineEditor
            lines={form.lines}
            products={products}
            useCostPrice={useCostPrice}
            onChange={(lines) => setForm((current) => ({ ...current, lines }))}
          />
        </div>

        <Textarea
          label="Notes"
          rows={2}
          value={form.notes}
          onChange={(event) =>
            setForm((current) => ({ ...current, notes: event.target.value }))
          }
        />

        {error && (
          <p role="alert" className="text-[13px] text-critical">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
