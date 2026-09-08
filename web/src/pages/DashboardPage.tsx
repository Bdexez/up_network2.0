import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Boxes,
  Contact,
  FileSignature,
  FileText,
  Receipt,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { api, errorMessage } from '../lib/api';
import { count, formatDateTime, money } from '../lib/format';
import {
  LEAD_STATUS_LABEL,
  LEAD_STATUS_ORDER,
  STAGE_LABEL,
} from '../lib/labels';
import { INVOICE_FLOW, ORDER_FLOW, QUOTE_FLOW } from '../lib/documents';
import type {
  DashboardOverview,
  InvoiceStatus,
  LeadStatus,
  LeadStatusStat,
  OpportunityStage,
  OrderStatus,
  QuoteStatus,
  RecentEvent,
  RevenuePoint,
  TopPartner,
} from '../lib/types';
import { Card, CardHeader, EmptyState, ErrorState, Spinner } from '../components/ui/Surface';
import { PageHeader } from '../components/ui/Surface';
import { RevenueChart } from '../components/charts/RevenueChart';
import { BarList } from '../components/charts/BarList';
import { useAuth } from '../auth/AuthContext';
import { P } from '../lib/permissions';

export function DashboardPage() {
  const { user, can } = useAuth();

  const overview = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => (await api.get<DashboardOverview>('/dashboard/overview')).data,
  });

  const revenue = useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: async () =>
      (await api.get<RevenuePoint[]>('/dashboard/revenue', { params: { months: 6 } })).data,
  });

  const topPartners = useQuery({
    queryKey: ['dashboard', 'top-partners'],
    queryFn: async () => (await api.get<TopPartner[]>('/dashboard/top-partners')).data,
  });

  const recent = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: async () => (await api.get<RecentEvent[]>('/dashboard/recent')).data,
  });

  const leadStats = useQuery({
    queryKey: ['crm', 'leads', 'stats'],
    queryFn: async () => (await api.get<LeadStatusStat[]>('/crm/leads/stats')).data,
    enabled: can(P.leadsRead),
  });

  const firstName = user?.firstName ?? user?.username ?? '';
  const stats = overview.data;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={firstName ? `Bonjour ${firstName}` : 'Tableau de bord'}
        description={`Activité de ${user?.company?.name ?? 'votre société'}.`}
      />

      {overview.isLoading ? (
        <Card>
          <Spinner />
        </Card>
      ) : overview.isError ? (
        <Card>
          <ErrorState
            message={errorMessage(overview.error)}
            onRetry={() => void overview.refetch()}
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Chiffre d'affaires facturé"
              value={money(stats?.revenue)}
              hint={`${money(stats?.monthRevenue)} ce mois-ci · HT`}
              icon={<TrendingUp size={16} />}
            />
            <StatTile
              label="Encours client"
              value={money(stats?.outstandingAmount)}
              hint={`${count(stats?.overdueInvoices)} facture(s) en retard`}
              icon={<Banknote size={16} />}
              tone={stats?.overdueInvoices ? 'alert' : undefined}
              to={can(P.invoicesRead) ? '/factures' : undefined}
            />
            <StatTile
              label="Devis en cours"
              value={money(stats?.openQuotesAmount)}
              hint={`${count(stats?.openQuotes)} devis à suivre`}
              icon={<FileSignature size={16} />}
              to={can(P.quotesRead) ? '/devis' : undefined}
            />
            <StatTile
              label="Pipeline ouvert"
              value={money(stats?.openPipelineAmount)}
              hint={`${count(stats?.openOpportunities)} opportunité(s) en cours`}
              icon={<Target size={16} />}
              to={can(P.opportunitiesRead) ? '/crm/pipeline' : undefined}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Clients actifs"
              value={count(stats?.partners)}
              hint={`${count(stats?.orders)} commande(s) enregistrée(s)`}
              icon={<Contact size={16} />}
              to={can(P.partnersRead) ? '/clients' : undefined}
            />
            <StatTile
              label="Factures émises"
              value={count(stats?.invoices)}
              hint={`${money(stats?.wonAmount)} d'affaires gagnées`}
              icon={<Receipt size={16} />}
              to={can(P.invoicesRead) ? '/factures' : undefined}
            />
            <StatTile
              label="Références en alerte"
              value={count(stats?.lowStock)}
              hint="Sous le seuil de réapprovisionnement"
              icon={<Boxes size={16} />}
              tone={stats?.lowStock ? 'alert' : undefined}
              to={can(P.stockRead) ? '/stock' : undefined}
            />
            <StatTile
              label="Produits au catalogue"
              value={count(stats?.products)}
              hint={`${count(stats?.openLeads)} piste(s) à traiter`}
              icon={<FileText size={16} />}
              to={can(P.productsRead) ? '/produits' : undefined}
            />
          </div>

          {!!stats?.overdueActivities && can(P.activitiesRead) && (
            <Link
              to="/crm/activites"
              className="flex items-center gap-2.5 rounded-xl border border-line bg-serious-soft px-4 py-3 transition-colors hover:border-line-strong"
            >
              <AlertTriangle size={17} className="shrink-0 text-serious" aria-hidden />
              <p className="flex-1 text-[13px] text-ink">
                <span className="font-semibold">
                  {count(stats.overdueActivities)} activité(s) en retard
                </span>{' '}
                — leur échéance est dépassée.
              </p>
              <ArrowUpRight size={16} className="shrink-0 text-ink-3" aria-hidden />
            </Link>
          )}
        </>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Chiffre d'affaires mensuel"
            subtitle="Total HT facturé sur les 6 derniers mois"
          />
          <div className="p-4">
            {revenue.isLoading ? (
              <Spinner />
            ) : revenue.isError ? (
              <ErrorState message={errorMessage(revenue.error)} />
            ) : (
              <RevenueChart data={revenue.data ?? []} />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Meilleurs clients" subtitle="Par chiffre d'affaires facturé" />
          <div className="p-4">
            {topPartners.isLoading ? (
              <Spinner />
            ) : (topPartners.data?.length ?? 0) === 0 ? (
              <EmptyState
                title="Aucune facture"
                description="Les meilleurs clients apparaîtront ici dès la première facture."
              />
            ) : (
              <BarList
                items={(topPartners.data ?? []).map((partner) => ({
                  key: partner.partnerId,
                  label: partner.name,
                  value: partner.total,
                }))}
              />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {can(P.leadsRead) && (
          <Card>
            <CardHeader title="Pistes par statut" subtitle="Répartition du haut de tunnel" />
            <div className="p-4">
              {leadStats.isLoading ? (
                <Spinner />
              ) : (leadStats.data ?? []).every((row) => row.count === 0) ? (
                <EmptyState
                  title="Aucune piste"
                  description="Créez une première piste pour alimenter le tunnel."
                />
              ) : (
                <BarList
                  items={LEAD_STATUS_ORDER.map((status) => {
                    const row = leadStats.data?.find((item) => item.status === status);
                    return {
                      key: status,
                      label: LEAD_STATUS_LABEL[status],
                      value: row?.count ?? 0,
                      display: `${count(row?.count)} · ${money(row?.estimatedValue)}`,
                    };
                  })}
                />
              )}
            </div>
          </Card>
        )}

        <Card>
          <CardHeader title="Activité récente" subtitle="Derniers mouvements enregistrés" />
          {recent.isLoading ? (
            <Spinner />
          ) : (recent.data?.length ?? 0) === 0 ? (
            <EmptyState title="Rien à afficher" description="L'activité s'affichera ici." />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {recent.data?.map((event) => (
                <li
                  key={`${event.type}-${event.id}`}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-sunken text-ink-3">
                    {event.type === 'quote' ? (
                      <FileSignature size={14} aria-hidden />
                    ) : event.type === 'order' ? (
                      <FileText size={14} aria-hidden />
                    ) : event.type === 'invoice' ? (
                      <Receipt size={14} aria-hidden />
                    ) : event.type === 'lead' ? (
                      <Target size={14} aria-hidden />
                    ) : (
                      <TrendingUp size={14} aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-ink">
                      {eventLabel(event)}
                    </p>
                    <p className="text-[11px] text-ink-3">{formatDateTime(event.date)}</p>
                  </div>
                  <span className="shrink-0 text-[13px] font-medium tabular-nums text-ink-2">
                    {money(event.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/** Phrase lisible pour une ligne du flux d'activité. */
function eventLabel(event: RecentEvent) {
  switch (event.type) {
    case 'quote': {
      const status = QUOTE_FLOW.meta[event.stage as QuoteStatus]?.label;
      return `Devis ${event.ref} — ${event.name}${status ? ` · ${status}` : ''}`;
    }
    case 'order': {
      const status = ORDER_FLOW.meta[event.stage as OrderStatus]?.label;
      return `Commande ${event.ref} — ${event.name}${status ? ` · ${status}` : ''}`;
    }
    case 'invoice': {
      const status = INVOICE_FLOW.meta[event.stage as InvoiceStatus]?.label;
      return `Facture ${event.ref} — ${event.name}${status ? ` · ${status}` : ''}`;
    }
    case 'lead': {
      const status = LEAD_STATUS_LABEL[event.stage as LeadStatus];
      return `Piste « ${event.name} »${status ? ` — ${status}` : ''}`;
    }
    default: {
      const stage = STAGE_LABEL[event.stage as OpportunityStage];
      return `Opportunité « ${event.name} »${stage ? ` — ${stage}` : ''}`;
    }
  }
}

function StatTile({
  label,
  value,
  hint,
  icon,
  tone,
  to,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  tone?: 'good' | 'alert';
  to?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-ink-2">{label}</p>
        <span
          className={
            tone === 'good'
              ? 'grid size-7 place-items-center rounded-lg bg-good-soft text-good'
              : tone === 'alert'
                ? 'grid size-7 place-items-center rounded-lg bg-serious-soft text-serious'
                : 'grid size-7 place-items-center rounded-lg bg-sunken text-ink-3'
          }
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink-3">{hint}</p>
    </>
  );

  const className =
    'rounded-xl border border-line bg-surface p-4 transition-colors' +
    (to ? ' hover:border-line-strong' : '');

  return to ? (
    <Link to={to} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
