import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, errorMessage } from '../../lib/api';
import { useWrite } from '../../lib/hooks';
import { count } from '../../lib/format';
import { P } from '../../lib/permissions';
import type { CompanyDetail } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import {
  Card,
  CardHeader,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';

export function CompanyPage() {
  const { can, refresh } = useAuth();
  const [name, setName] = useState('');

  const company = useQuery({
    queryKey: ['company', 'current'],
    queryFn: async () => (await api.get<CompanyDetail>('/companies/current')).data,
  });

  useEffect(() => {
    if (company.data) setName(company.data.name);
  }, [company.data]);

  const save = useWrite<{ name: string }>(
    async (body) => (await api.patch('/companies/current', body)).data,
    { invalidate: [['company']], success: 'Société mise à jour' },
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate({ name }, { onSuccess: () => void refresh() });
  };

  const counters = company.data?._count;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Société" description="Les informations de votre espace." />

      {company.isLoading ? (
        <Card>
          <Spinner />
        </Card>
      ) : company.isError ? (
        <Card>
          <ErrorState
            message={errorMessage(company.error)}
            onRetry={() => void company.refetch()}
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Identité" />
            <form onSubmit={submit} className="flex flex-col gap-3.5 p-4">
              <Input
                label="Nom de la société"
                required
                value={name}
                disabled={!can(P.companyUpdate)}
                onChange={(event) => setName(event.target.value)}
              />
              <Input
                label="Code société"
                value={company.data?.code ?? ''}
                readOnly
                disabled
                hint="Ce code permet à un collègue de rejoindre votre espace à l'inscription."
              />

              {can(P.companyUpdate) && (
                <Button
                  type="submit"
                  variant="primary"
                  loading={save.isPending}
                  disabled={!name || name === company.data?.name}
                  className="self-start"
                >
                  Enregistrer
                </Button>
              )}
            </form>
          </Card>

          <Card>
            <CardHeader title="Contenu" subtitle="Volumétrie de votre espace" />
            <dl className="divide-y divide-[var(--border)]">
              {[
                ['Utilisateurs', counters?.users],
                ['Rôles', counters?.roles],
                ['Clients', counters?.partners],
                ['Produits', counters?.products],
                ['Commandes', counters?.orders],
                ['Pistes', counters?.leads],
                ['Opportunités', counters?.opportunities],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-baseline justify-between px-4 py-2.5">
                  <dt className="text-[13px] text-ink-2">{label}</dt>
                  <dd className="text-[13px] font-medium tabular-nums text-ink">
                    {count(value as number)}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      )}
    </div>
  );
}
