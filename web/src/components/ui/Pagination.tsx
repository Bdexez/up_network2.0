import { ChevronLeft, ChevronRight } from 'lucide-react';
import { count } from '../../lib/format';
import { Button } from './Button';

/**
 * Barre de pagination sous une liste. Masquée quand tout tient sur une page,
 * pour ne pas encombrer les écrans peu remplis.
 */
export function Pagination({
  page,
  totalPages,
  total,
  perPage,
  onChange,
  label = 'éléments',
}: {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5"
      aria-label="Pagination"
    >
      <p className="text-xs tabular-nums text-ink-3">
        {count(first)}–{count(last)} sur {count(total)} {label}
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          icon={<ChevronLeft size={14} />}
          aria-label="Page précédente"
        />
        <span className="px-1 text-xs tabular-nums text-ink-2">
          Page {page} / {totalPages}
        </span>
        <Button
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          icon={<ChevronRight size={14} />}
          aria-label="Page suivante"
        />
      </div>
    </nav>
  );
}
