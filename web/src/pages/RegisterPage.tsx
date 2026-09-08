import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { errorMessage } from '../lib/api';
import { AuthShell } from './LoginPage';

export function RegisterPage() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const update = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
    } catch (caught) {
      setError(errorMessage(caught, 'Inscription impossible'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Créer une société"
      subtitle="Votre compte devient administrateur du nouvel espace."
      footer={
        <>
          Déjà inscrit ?{' '}
          <Link to="/connexion" className="font-medium text-accent hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-3.5" noValidate>
        <Input
          label="Nom de la société"
          required
          value={form.companyName}
          onChange={update('companyName')}
          placeholder="Acme Studio"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Prénom" value={form.firstName} onChange={update('firstName')} />
          <Input label="Nom" value={form.lastName} onChange={update('lastName')} />
        </div>

        <Input
          label="Nom d'utilisateur"
          required
          minLength={3}
          maxLength={20}
          value={form.username}
          onChange={update('username')}
          placeholder="jdupont"
        />
        <Input
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update('email')}
        />
        <Input
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          hint="6 caractères minimum"
          value={form.password}
          onChange={update('password')}
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
          Créer mon espace
        </Button>
      </form>
    </AuthShell>
  );
}
