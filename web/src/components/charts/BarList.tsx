import { money } from '../../lib/format';

export interface BarListItem {
  key: string | number;
  label: string;
  value: number;
  /** Texte affiché à droite ; à défaut la valeur formatée en euros. */
  display?: string;
  color?: string;
}

/**
 * Barres horizontales à série unique. Chaque barre porte son étiquette et sa
 * valeur en clair : l'information ne repose jamais sur la seule couleur.
 */
export function BarList({
  items,
  formatValue = (value: number) => money(value),
}: {
  items: BarListItem[];
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.key} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-[13px] text-ink-2">{item.label}</span>
            <span className="shrink-0 text-[13px] font-medium tabular-nums text-ink">
              {item.display ?? formatValue(item.value)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-sunken">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${Math.max((item.value / max) * 100, item.value > 0 ? 3 : 0)}%`,
                background: item.color ?? 'var(--series-1)',
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
