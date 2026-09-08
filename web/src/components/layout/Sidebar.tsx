import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { Boxes, X } from 'lucide-react';
import { NAV_SECTIONS } from './navigation';
import { useAuth } from '../../auth/AuthContext';

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const { can } = useAuth();

  // Une section dont aucune entrée n'est permise disparaît entièrement.
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => can(item.permission)),
  })).filter((section) => section.items.length > 0);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-surface',
          'transition-transform duration-200 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent text-accent-ink">
              <Boxes size={16} aria-hidden />
            </span>
            <span className="truncate text-sm font-semibold tracking-tight text-ink">
              Up Network
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-3 hover:bg-sunken hover:text-ink lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={17} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3" aria-label="Navigation principale">
          {sections.map((section) => (
            <div key={section.title} className="mb-4 last:mb-0">
              <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-widest text-ink-3 uppercase">
                {section.title}
              </p>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors',
                          isActive
                            ? 'bg-accent-soft text-accent'
                            : 'text-ink-2 hover:bg-sunken hover:text-ink',
                        )
                      }
                    >
                      <item.icon size={16} className="shrink-0" aria-hidden />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
