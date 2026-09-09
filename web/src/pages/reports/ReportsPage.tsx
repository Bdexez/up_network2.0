import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { BellRing, FileSpreadsheet, Percent, Scale } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useWrite } from '../../lib/hooks';
import { useFileDownload } from '../../lib/download';
import { formatDate, money } from '../../lib/format';
import { AGING_BUCKETS, BUCKET_TONE } from '../../lib/reports';
import { P } from '../../lib/permissions';
import type { AgingReport, OverdueInvoice, VatSummary } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../../components/ui/Table';

type Tab = 'aging' | 'overdue' | 'vat';

export function ReportsPage() {
  const { can, user } = useAuth();
  const currency = user?.company?.currency ?? 'EUR';
  const [tab, setTab] = useState<Tab>('aging');
  const pdf = useFileDownload();

  const year = new Date().getFullYear();
  const [from, setFrom] = useState(`${year}-01-01`);
  const [to, setTo] = useState(`${year}-12-31`);

  const aging = useQuery({
    queryKey: ['reports', 'aging'],
    queryFn: async () => (await api.get<AgingReport>('/reports/aging')).data,
    enabled: tab === 'aging',
  });

  const overdue = useQuery({
    queryKey: ['reports', 'overdue'],
    queryFn: async () => (await api.get<OverdueInvoice[]>('/reports/overdue')).data,
    enabled: tab === 'overdue',
  });

  const vat = useQuery({
    queryKey: ['reports', 'vat', from, to],
    queryFn: async () =>
      (await api.get<VatSummary>('/reports/vat', { params: { from, to } })).data,
    enabled: tab === 'vat',
  });

  const remind = useWrite<number>(
    async (id) => (await api.post(`/reports/overdue/${id}/reminder`)).data,
    { invalidate: [['reports']], success: 'Relance enregistrée' },
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="États comptables"
        description="Encours client, relances, TVA et export réglementaire."
        actions={
          can(P.reportsExport) && (
            <Button
              icon={<FileSpreadsheet size={15} />}
              loading={pdf.pendingId === 'fec'}
              onClick={() =>
                void pdf.download(
                  `/reports/fec?from=${from}&to=${to}`,
                  `FEC_${to.replace(/-/g, '')}.txt`,
                  'fec',
                )
              }
            >
              Export FEC
            </Button>
          )
        }
      />

      <div className="flex items-center gap-1 border-b border-line">
        <TabButton active={tab === 'aging'} onClick={() => setTab('aging')}>
          Balance âgée
        </TabButton>
        <TabButton active={tab === 'overdue'} onClick={() => setTab('overdue')}>
          Relances
        </TabButton>
        <TabButton active={tab === 'vat'} onClick={() => setTab('vat')}>
          TVA
        </TabButton>
      </div>

      {tab === 'aging' && (
        <Card>
          <CardHeader
            title="Balance âgée"
            subtitle="Ce que doit chaque client, par ancienneté du retard"
            action={
              aging.data && (
                <span className="text-sm font-semibold tabular-nums text-ink">
                  {money(aging.data.total, true, currency)}
                </span>
              )
            }
          />
          {aging.isLoading ? (
            <Spinner />
          ) : aging.isError ? (
            <ErrorState message={errorMessage(aging.error)} />
          ) : (aging.data?.rows.length ?? 0) === 0 ? (
            <EmptyState
              icon={<Scale size={26} />}
              title="Aucun encours"
              description="Toutes les factures émises sont réglées."
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Client</Th>
                  {AGING_BUCKETS.map((bucket) => (
                    <Th key={bucket.key} align="right">
                      {bucket.label}
                    </Th>
                  ))}
                  <Th align="right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {aging.data?.rows.map((row) => (
                  <Tr key={row.partnerId}>
                    <Td className="font-medium text-ink">{row.partnerName}</Td>
                    {AGING_BUCKETS.map((bucket) => (
                      <Td key={bucket.key} align="right" numeric>
                        {row.buckets[bucket.key]
                          ? money(row.buckets[bucket.key], true, currency)
                          : '—'}
                      </Td>
                    ))}
                    <Td align="right" numeric className="font-medium text-ink">
                      {money(row.total, true, currency)}
                    </Td>
                  </Tr>
                ))}
                <tr className="bg-sunken">
                  <Td className="font-semibold text-ink">Total</Td>
                  {AGING_BUCKETS.map((bucket) => (
                    <Td key={bucket.key} align="right" numeric>
                      <span
                        className={clsx(
                          'font-medium',
                          BUCKET_TONE[bucket.key] === 'critical' && 'text-critical',
                          BUCKET_TONE[bucket.key] === 'serious' && 'text-serious',
                        )}
                      >
                        {aging.data?.totals[bucket.key]
                          ? money(aging.data.totals[bucket.key], true, currency)
                          : '—'}
                      </span>
                    </Td>
                  ))}
                  <Td align="right" numeric className="font-semibold text-ink">
                    {money(aging.data?.total, true, currency)}
                  </Td>
                </tr>
              </tbody>
            </TableWrap>
          )}
        </Card>
      )}

      {tab === 'overdue' && (
        <Card>
          <CardHeader
            title="Factures à relancer"
            subtitle="Échéance dépassée et solde restant dû"
          />
          {overdue.isLoading ? (
            <Spinner />
          ) : (overdue.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={<BellRing size={26} />}
              title="Aucun retard"
              description="Toutes les échéances sont respectées."
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Facture</Th>
                  <Th>Client</Th>
                  <Th align="right">Échéance</Th>
                  <Th align="right">Reste dû</Th>
                  <Th>Relances</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {overdue.data?.map((invoice) => (
                  <Tr key={invoice.id}>
                    <Td className="font-medium text-ink">{invoice.ref}</Td>
                    <Td>
                      {invoice.partner.name}
                      {invoice.partner.email && (
                        <span className="block text-xs text-ink-3">
                          {invoice.partner.email}
                        </span>
                      )}
                    </Td>
                    <Td align="right" numeric>
                      {formatDate(invoice.dueDate)}
                    </Td>
                    <Td align="right" numeric className="font-medium text-ink">
                      {money(invoice.remaining, true, invoice.currency)}
                    </Td>
                    <Td>
                      {invoice.reminderCount === 0 ? (
                        <Badge tone="neutral">Aucune</Badge>
                      ) : (
                        <Badge tone={invoice.reminderCount >= 3 ? 'critical' : 'warning'}>
                          Niveau {invoice.reminderCount} ·{' '}
                          {formatDate(invoice.lastReminderAt)}
                        </Badge>
                      )}
                    </Td>
                    <Td align="right">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<BellRing size={14} />}
                        loading={remind.isPending && remind.variables === invoice.id}
                        onClick={() => remind.mutate(invoice.id)}
                      >
                        Relancer
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>
      )}

      {tab === 'vat' && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Période" />
            <div className="grid gap-3.5 p-4 sm:grid-cols-2">
              <Input
                label="Du"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
              <Input
                label="Au"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </Card>

          {vat.isLoading ? (
            <Card>
              <Spinner />
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <VatCard
                title="TVA collectée"
                subtitle="Sur les factures émises, avoirs déduits"
                rows={vat.data?.collected ?? []}
                total={vat.data?.totalCollected ?? 0}
                currency={currency}
              />
              <VatCard
                title="TVA déductible"
                subtitle="Sur les commandes fournisseur"
                rows={vat.data?.deductible ?? []}
                total={vat.data?.totalDeductible ?? 0}
                currency={currency}
              />

              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-2">
                    <Percent size={16} className="text-ink-3" aria-hidden />
                    <p className="text-[13px] font-medium text-ink">
                      {(vat.data?.balance ?? 0) >= 0
                        ? 'TVA à reverser'
                        : 'Crédit de TVA'}
                    </p>
                  </div>
                  <p className="text-xl font-semibold tabular-nums text-ink">
                    {money(Math.abs(vat.data?.balance ?? 0), true, currency)}
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VatCard({
  title,
  subtitle,
  rows,
  total,
  currency,
}: {
  title: string;
  subtitle: string;
  rows: { rate: number; base: number; vat: number }[];
  total: number;
  currency: string;
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      {rows.length === 0 ? (
        <EmptyState title="Aucun montant sur la période" />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Taux</Th>
              <Th align="right">Base HT</Th>
              <Th align="right">TVA</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Tr key={row.rate}>
                <Td>{row.rate} %</Td>
                <Td align="right" numeric>
                  {money(row.base, true, currency)}
                </Td>
                <Td align="right" numeric className="font-medium text-ink">
                  {money(row.vat, true, currency)}
                </Td>
              </Tr>
            ))}
            <tr className="bg-sunken">
              <Td className="font-semibold text-ink">Total</Td>
              <Td />
              <Td align="right" numeric className="font-semibold text-ink">
                {money(total, true, currency)}
              </Td>
            </tr>
          </tbody>
        </TableWrap>
      )}
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        '-mb-px border-b-2 px-3 pb-2 text-[13px] font-medium transition-colors',
        active ? 'border-accent text-accent' : 'border-transparent text-ink-2 hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
