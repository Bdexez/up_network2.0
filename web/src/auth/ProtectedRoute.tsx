import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { ForbiddenPage } from '../pages/ForbiddenPage';

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-page">
        <Loader2 size={22} className="animate-spin text-ink-3" aria-label="Chargement" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/** Barrière de permission : rend la page seulement si le rôle l'autorise. */
export function RequirePermission({ permission }: { permission: string }) {
  const { can } = useAuth();
  return can(permission) ? <Outlet /> : <ForbiddenPage />;
}
