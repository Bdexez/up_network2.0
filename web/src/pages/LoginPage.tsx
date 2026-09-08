import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { errorMessage } from '../lib/api';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@demo.com', password: 'admin123' },
  { label: 'Commercial', email: 'commercial@demo.com', password: 'demo1234' },
  { label: 'Lecteur', email: 'lecteur@demo.com', password: 'demo1234' },
];

export function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
    } catch (caught) {
      setError(errorMessage(caught, 'Connexion impossible'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à votre espace ERP et CRM."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="font-medium text-accent hover:underline">
            Créer une société
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-3.5" noValidate>
        <Input
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vous@entreprise.fr"
        />
        <Input
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-line bg-critical-soft px-3 py-2 text-[13px] text-critical"
          >
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" loading={loading} className="mt-1 w-full">
          Se connecter
        </Button>
      </form>

      <div className="mt-5 border-t border-line pt-4">
        <p className="mb-2 text-[11px] font-semibold tracking-widest text-ink-3 uppercase">
          Comptes de démonstration
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemo(account)}
              className="rounded-lg border border-line bg-raised px-2.5 py-1 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-ink">
            <Boxes size={19} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-ink">Up Network</p>
            <p className="text-xs text-ink-3">ERP &amp; CRM</p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-6">
          <h1 className="text-lg font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-1 mb-5 text-[13px] text-ink-3">{subtitle}</p>
          {children}
        </div>

        <p className="mt-4 text-center text-[13px] text-ink-3">{footer}</p>
      </div>
    </div>
  );
}
