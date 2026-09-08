import { useEffect, useRef, useState } from 'react';
import { Building2, Check, LogOut, Menu, Monitor, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../ThemeProvider';
import { useToast } from '../ui/Toast';
import { errorMessage } from '../../lib/api';
import { initials } from '../../lib/format';

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user, logout, switchCompany } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notify } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || '';

  const handleSwitch = async (companyId: number) => {
    setMenuOpen(false);
    try {
      await switchCompany(companyId);
      notify('Société active changée');
    } catch (error) {
      notify(errorMessage(error), 'error');
    }
  };

  const cycleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const themeLabel =
    theme === 'light' ? 'Thème clair' : theme === 'dark' ? 'Thème sombre' : 'Thème système';

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface/85 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onOpenMenu}
        className="rounded-md p-1.5 text-ink-2 hover:bg-sunken hover:text-ink lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu size={18} />
      </button>

      <div className="flex min-w-0 items-center gap-1.5 text-[13px] text-ink-3">
        <Building2 size={14} className="shrink-0" aria-hidden />
        <span className="truncate font-medium text-ink-2">
          {user?.company?.name ?? 'Aucune société'}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={cycleTheme}
          className="rounded-md p-1.5 text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
          aria-label={`${themeLabel} — cliquer pour changer`}
          title={themeLabel}
        >
          <ThemeIcon size={17} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-sunken"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              {initials(displayName || user?.email || '?')}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-36 truncate text-[13px] font-medium text-ink">
                {displayName}
              </span>
              <span className="block text-[11px] text-ink-3">
                {user?.role?.name ?? 'Sans rôle'}
              </span>
            </span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="fk-enter absolute right-0 top-[calc(100%+0.4rem)] w-64 overflow-hidden rounded-xl border border-line bg-raised shadow-xl"
            >
              <div className="border-b border-line px-3 py-2.5">
                <p className="truncate text-[13px] font-medium text-ink">{displayName}</p>
                <p className="truncate text-xs text-ink-3">{user?.email}</p>
              </div>

              {(user?.companies.length ?? 0) > 1 && (
                <div className="border-b border-line py-1.5">
                  <p className="px-3 pb-1 text-[10px] font-semibold tracking-widest text-ink-3 uppercase">
                    Sociétés
                  </p>
                  {user?.companies.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      role="menuitem"
                      onClick={() => void handleSwitch(company.id)}
                      className={clsx(
                        'flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-sunken',
                        company.isActive ? 'text-ink' : 'text-ink-2',
                      )}
                    >
                      <span className="truncate">{company.name}</span>
                      {company.isActive && (
                        <Check size={14} className="shrink-0 text-accent" aria-hidden />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
              >
                <LogOut size={15} aria-hidden />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
