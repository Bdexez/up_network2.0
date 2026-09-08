import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-4xl font-semibold tracking-tight text-ink">404</p>
      <p className="text-sm text-ink-2">Cette page n'existe pas.</p>
      <Link to="/" className="text-[13px] font-medium text-accent hover:underline">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
