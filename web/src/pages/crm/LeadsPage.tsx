import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRightLeft, Pencil, Plus, Target, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useDebounced, useList, usePage, usePagination, useWrite } from '../../lib/hooks';
import { formatDate, money } from '../../lib/format';
import { LEAD_STATUS_LABEL, LEAD_STATUS_ORDER } from '../../lib/labels';
import { P } from '../../lib/permissions';
import type { Lead, LeadStatus, PartnerOption } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';

const STATUS_TONE: Record<LeadStatus, 'neutral' | 'accent' | 'good' | 'critical'> = {
  NEW: 'neutral',
  CONTACTED: 'accent',
  QUALIFIED: 'accent',
  UNQUALIFIED: 'critical',
  CONVERTED: 'good',
};

const EMPTY = {
  name: '',
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  source: '',
  status: 'NEW' as LeadStatus,
  estimatedValue: '',
  description: '',
};

export function LeadsPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<Lead | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Lead | null>(null);
  const [converting, setConverting] = useState<Lead | null>(null);

  const pagination = usePagination();
  const leads = usePage<Lead>(['crm', 'leads'], '/crm/leads', {
    ...pagination.params,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
  });

  const save = useWrite<{ id?: number; body: typeof EMPTY }>(
    async ({ id, body }) => {
      const payload: Record<string, unknown> = {
        name: body.name,
        status: body.status,
        estimatedValue: Number(body.estimatedValue) || 0,
      };
      for (const key of ['companyName', 'contactName', 'email', 'phone', 'source', 'description'] as const) {
        if (body[key]) payload[key] = body[key];
      }
      if (id) return (await api.patch(`/crm/leads/${id}`, payload)).data;
      return (await api.post('/crm/leads', payload)).data;
    },
    { invalidate: [['crm', 'leads'], ['dashboard']], success: 'Piste enregistrée' },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/crm/leads/${id}`)).data,
    { invalidate: [['crm', 'leads'], ['dashboard']], success: 'Piste supprimée' },
  );

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Pistes"
        description="Les contacts entrants, avant qualification."
        actions={
          <>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                pagination.reset();
              }}
              placeholder="Nom, société, e-mail…"
            />
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                pagination.reset();
              }}
              aria-label="Filtrer par statut"
              className="h-9 cursor-pointer rounded-lg border border-line bg-raised px-3 text-sm text-ink hover:border-line-strong focus:border-accent"
            >
              <option value="">Tous les statuts</option>
              {LEAD_STATUS_ORDER.map((value) => (
                <option key={value} value={value}>
                  {LEAD_STATUS_LABEL[value]}
                </option>
              ))}
            </select>
            {can(P.leadsCreate) && (
              <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                Nouvelle piste
              </Button>
            )}
          </>
        }
      />

      <Card>
        {leads.isLoading ? (
          <Spinner />
        ) : leads.isError ? (
          <ErrorState message={errorMessage(leads.error)} onRetry={() => void leads.refetch()} />
        ) : leads.items.length === 0 ? (
          <EmptyState
            icon={<Target size={26} />}
            title={search || status ? 'Aucun résultat' : 'Aucune piste'}
            description={
              search || status
                ? 'Aucune piste ne correspond à ces critères.'
                : 'Enregistrez vos contacts entrants ici, puis convertissez-les en clients.'
            }
            action={
              !search && !status && can(P.leadsCreate) ? (
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Nouvelle piste
                </Button>
              ) : undefined
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Piste</Th>
                <Th>Société</Th>
                <Th>Statut</Th>
                <Th>Source</Th>
                <Th align="right">Potentiel</Th>
                <Th align="right">Créée le</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {leads.items.map((lead) => (
                <Tr key={lead.id}>
                  <Td>
                    <span className="font-medium text-ink">{lead.name}</span>
                    {lead.contactName && (
                      <span className="block text-xs text-ink-3">
                        {lead.contactName}
                        {lead.email ? ` · ${lead.email}` : ''}
                      </span>
                    )}
                  </Td>
                  <Td>{lead.companyName ?? '—'}</Td>
                  <Td>
                    <Badge tone={STATUS_TONE[lead.status]}>
                      {LEAD_STATUS_LABEL[lead.status]}
                    </Badge>
                    {lead.convertedPartner && (
                      <span className="block pt-0.5 text-[11px] text-ink-3">
                        → {lead.convertedPartner.name}
                      </span>
                    )}
                  </Td>
                  <Td>{lead.source ?? '—'}</Td>
                  <Td align="right" numeric>
                    {money(lead.estimatedValue)}
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(lead.createdAt)}
                  </Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1">
                      {lead.status !== 'CONVERTED' && can(P.leadsConvert) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<ArrowRightLeft size={14} />}
                          onClick={() => setConverting(lead)}
                        >
                          Convertir
                        </Button>
                      )}
                      {can(P.leadsUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Modifier ${lead.name}`}
                          onClick={() => setEditing(lead)}
                          icon={<Pencil size={14} />}
                        />
                      )}
                      {can(P.leadsDelete) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Supprimer ${lead.name}`}
                          onClick={() => setDeleting(lead)}
                          icon={<Trash2 size={14} />}
                        />
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        )}

        <Pagination
          page={leads.page}
          totalPages={leads.totalPages}
          total={leads.total}
          perPage={pagination.perPage}
          onChange={pagination.setPage}
          label="pistes"
        />
      </Card>

      <LeadForm
        open={creating || editing !== null}
        lead={editing}
        loading={save.isPending}
        onClose={closeForm}
        onSubmit={(body) => save.mutate({ id: editing?.id, body }, { onSuccess: closeForm })}
      />

      <ConvertDialog lead={converting} onClose={() => setConverting(null)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette piste ?"
        message={`« ${deleting?.name} » et ses activités liées seront supprimées.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

function LeadForm({
  open,
  lead,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  lead: Lead | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (body: typeof EMPTY) => void;
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(
      lead
        ? {
            name: lead.name,
            companyName: lead.companyName ?? '',
            contactName: lead.contactName ?? '',
            email: lead.email ?? '',
            phone: lead.phone ?? '',
            source: lead.source ?? '',
            status: lead.status,
            estimatedValue: String(lead.estimatedValue),
            description: lead.description ?? '',
          }
        : EMPTY,
    );
  }, [open, lead]);

  const update =
    (key: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lead ? 'Modifier la piste' : 'Nouvelle piste'}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={loading} form="lead-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="lead-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Intitulé"
            required
            hint="Ex. « Refonte du parc logiciel »"
            value={form.name}
            onChange={update('name')}
          />
        </div>
        <Input label="Société" value={form.companyName} onChange={update('companyName')} />
        <Input label="Contact" value={form.contactName} onChange={update('contactName')} />
        <Input label="E-mail" type="email" value={form.email} onChange={update('email')} />
        <Input label="Téléphone" value={form.phone} onChange={update('phone')} />
        <Select label="Statut" value={form.status} onChange={update('status')}>
          {LEAD_STATUS_ORDER.filter((value) => value !== 'CONVERTED').map((value) => (
            <option key={value} value={value}>
              {LEAD_STATUS_LABEL[value]}
            </option>
          ))}
        </Select>
        <Input
          label="Potentiel (€)"
          type="number"
          min="0"
          step="0.01"
          value={form.estimatedValue}
          onChange={update('estimatedValue')}
        />
        <div className="sm:col-span-2">
          <Input
            label="Source"
            hint="Site web, salon, recommandation…"
            value={form.source}
            onChange={update('source')}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea label="Notes" rows={3} value={form.description} onChange={update('description')} />
        </div>
      </form>
    </Modal>
  );
}

function ConvertDialog({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const partners = useList<PartnerOption>(
    ['partner-options', 'customer'],
    '/partners/options',
    { type: 'CUSTOMER' },
  );
  const [partnerId, setPartnerId] = useState('');
  const [createOpportunity, setCreateOpportunity] = useState(true);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!lead) return;
    setPartnerId('');
    setCreateOpportunity(true);
    setAmount(String(lead.estimatedValue || ''));
  }, [lead]);

  const convert = useWrite<{ id: number; body: Record<string, unknown> }>(
    async ({ id, body }) => (await api.post(`/crm/leads/${id}/convert`, body)).data,
    {
      invalidate: [['crm'], ['partners'], ['dashboard']],
      success: 'Piste convertie',
    },
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!lead) return;
    const body: Record<string, unknown> = { createOpportunity };
    if (partnerId) body.partnerId = Number(partnerId);
    if (createOpportunity && amount) body.amount = Number(amount);
    convert.mutate({ id: lead.id, body }, { onSuccess: onClose });
  };

  return (
    <Modal
      open={lead !== null}
      onClose={onClose}
      title="Convertir la piste"
      description={lead ? `« ${lead.name} » deviendra un client de votre portefeuille.` : undefined}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={convert.isPending} form="convert-form" type="submit">
            Convertir
          </Button>
        </>
      }
    >
      <form id="convert-form" onSubmit={submit} className="flex flex-col gap-3.5">
        <Select
          label="Client"
          hint="Laissez vide pour créer un nouveau client à partir de la piste."
          value={partnerId}
          onChange={(event) => setPartnerId(event.target.value)}
        >
          <option value="">Créer un nouveau client</option>
          {partners.data?.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
            </option>
          ))}
        </Select>

        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          <input
            type="checkbox"
            checked={createOpportunity}
            onChange={(event) => setCreateOpportunity(event.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
          Créer aussi une opportunité dans le pipeline
        </label>

        {createOpportunity && (
          <Input
            label="Montant de l'opportunité (€)"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        )}
      </form>
    </Modal>
  );
}
