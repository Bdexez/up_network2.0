import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, errorMessage } from '../../lib/api';
import { useWrite } from '../../lib/hooks';
import { count } from '../../lib/format';
import { P } from '../../lib/permissions';
import { CURRENCIES, type CompanyDetail } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import {
  Card,
  CardHeader,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';

const EMPTY_FORM = {
  name: '',
  address: '',
  zipCode: '',
  city: '',
  country: '',
  email: '',
  phone: '',
  vatNumber: '',
  paymentTermsDays: '30',
  currency: 'EUR',
  allowNegativeStock: false,
};

export function CompanyPage() {
  const { can, refresh } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);

  const company = useQuery({
    queryKey: ['company', 'current'],
    queryFn: async () => (await api.get<CompanyDetail>('/companies/current')).data,
  });

  useEffect(() => {
    const data = company.data;
    if (!data) return;
    setForm({
      name: data.name,
      address: data.address ?? '',
      zipCode: data.zipCode ?? '',
      city: data.city ?? '',
      country: data.country ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      vatNumber: data.vatNumber ?? '',
      paymentTermsDays: String(data.paymentTermsDays ?? 30),
      currency: data.currency ?? 'EUR',
      allowNegativeStock: data.allowNegativeStock ?? false,
    });
  }, [company.data]);

  const save = useWrite<Record<string, unknown>>(
    async (body) => (await api.patch('/companies/current', body)).data,
    { invalidate: [['company']], success: 'Société mise à jour' },
  );

  const update = (key: keyof typeof EMPTY_FORM) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(
      {
        name: form.name,
        address: form.address || undefined,
        zipCode: form.zipCode || undefined,
        city: form.city || undefined,
        country: form.country || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        vatNumber: form.vatNumber || undefined,
        paymentTermsDays: Number(form.paymentTermsDays) || 0,
        currency: form.currency,
        allowNegativeStock: form.allowNegativeStock,
      },
      { onSuccess: () => void refresh() },
    );
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
            <CardHeader
              title="Identité et réglages"
              subtitle="Ces informations figurent sur vos documents commerciaux"
            />
            <form onSubmit={submit} className="grid gap-3.5 p-4 sm:grid-cols-2">
              <fieldset disabled={!can(P.companyUpdate)} className="contents">
                <div className="sm:col-span-2">
                  <Input
                    label="Nom de la société"
                    required
                    value={form.name}
                    onChange={update('name')}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Adresse" value={form.address} onChange={update('address')} />
                </div>
                <Input label="Code postal" value={form.zipCode} onChange={update('zipCode')} />
                <Input label="Ville" value={form.city} onChange={update('city')} />
                <Input label="Pays" value={form.country} onChange={update('country')} />
                <Input
                  label="N° TVA"
                  value={form.vatNumber}
                  onChange={update('vatNumber')}
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                />
                <Input label="Téléphone" value={form.phone} onChange={update('phone')} />

                <Input
                  label="Délai de règlement (jours)"
                  type="number"
                  min="0"
                  max="365"
                  hint="Appliqué aux factures, sauf délai négocié avec le tiers"
                  value={form.paymentTermsDays}
                  onChange={update('paymentTermsDays')}
                />
                <Select
                  label="Devise de tenue de comptes"
                  value={form.currency}
                  onChange={update('currency')}
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Code société"
                  value={company.data?.code ?? ''}
                  readOnly
                  disabled
                  hint="Permet à un collègue de rejoindre votre espace"
                />

                <label className="flex items-start gap-2 text-[13px] text-ink-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.allowNegativeStock}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        allowNegativeStock: event.target.checked,
                      }))
                    }
                    className="mt-0.5 size-4 accent-[var(--accent)]"
                  />
                  <span>
                    Autoriser le stock négatif
                    <span className="block text-xs text-ink-3">
                      Sans cette option, une sortie supérieure au disponible est refusée.
                    </span>
                  </span>
                </label>
              </fieldset>

              {can(P.companyUpdate) && (
                <Button
                  type="submit"
                  variant="primary"
                  loading={save.isPending}
                  disabled={!form.name}
                  className="self-start sm:col-span-2"
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
