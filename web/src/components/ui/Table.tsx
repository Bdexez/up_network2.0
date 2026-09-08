import clsx from 'clsx';
import type { ReactNode } from 'react';

/**
 * Enveloppe de tableau : le défilement horizontal reste à l'intérieur,
 * la page ne défile jamais latéralement.
 */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[42rem] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({
  children,
  align = 'left',
  className,
}: {
  children?: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={clsx(
        'border-b border-line px-4 py-2.5 text-[11px] font-semibold tracking-wide text-ink-3 uppercase',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = 'left',
  className,
  numeric,
}: {
  children?: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  numeric?: boolean;
}) {
  return (
    <td
      className={clsx(
        'border-b border-line px-4 py-2.5 align-middle text-ink-2',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        // Montants et dates : jamais coupés sur deux lignes.
        numeric && 'tabular-nums whitespace-nowrap',
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'transition-colors last:[&>td]:border-b-0',
        onClick && 'cursor-pointer hover:bg-sunken',
      )}
    >
      {children}
    </tr>
  );
}
