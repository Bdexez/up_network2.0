import { useState, type FormEvent, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck,
  FileSignature,
  FileText,
  Mail,
  Phone,
  Plus,
  Receipt,
  Star,
  Target,
  Trash2,
  UserRound,
} from 'lucide-react';
import { api, errorMessage } from '../lib/api';
import { useWrite } from '../lib/hooks';
import { formatDate, initials, money } from '../lib/format';
import {
  INVOICE_FLOW,
  ORDER_FLOW,
  PARTNER_TYPE_LABEL_MAP,
  QUOTE_FLOW,
} from '../lib/documents';
import { ACTIVITY_TYPE_LABEL, STAGE_LABEL } from '../lib/labels';
import { P } from '../lib/permissions';
import type { Contact, PartnerDetail } from '../lib/types';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../components/ui/Surface';
import { StatusBadge } from '../components/documents/StatusBadge';
import { Attachments } from '../components/documents/Attachments';

export function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();

  const partner = useQuery({
    queryKey: ['partners', 'detail', id],
    queryFn: async () => (await api.get<PartnerDetail>(`/partners/${id}`)).data,
    enabled: !!id,
  });

  if (partner.isLoading) {
    return (
      <Card>
        <Spinner />
      </Card>
    );
  }

  if (partner.isError || !partner.data) {
    return (
      <Card>
        <ErrorState
          message={errorMessage(partner.error, 'Tiers introuvable')}
          onRetry={() => void partner.refetch()}
        />
      </Card>
    );
  }

  const data = partner.data;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <button
          type="button"
          onClick={() => navigate('/clients')}
          className="mb-2 inline-flex items-center gap-1.5 text-[13px] text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} aria-hidden />
          Retour aux tiers
        </button>

        <PageHeader
          title={data.name}
          description={[data.zipCode, data.city, data.country].filter(Boolean).join(' ') || undefined}
          actions={
            <div className="flex items-center gap-2">
              <Badge tone={data.type === 'SUPPLIER' ? 'neutral' : 'accent'}>
                {PARTNER_TYPE_LABEL_MAP[data.type]}
              </Badge>
              {!data.isActive && <Badge tone="neutral">Archivé</Badge>}
            </div>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Coordonnées" />
            <dl className="divide-y divide-[var(--border)]">
              <Row label="E-mail" value={data.email} icon={<Mail size={13} />} />
              <Row label="Téléphone" value={data.phone} icon={<Phone size={13} />} />
              <Row label="Adresse" value={data.address} />
              <Row label="N° TVA" value={data.vatNumber} />
              <Row label="Site web" value={data.website} />
              <Row label="Client depuis" value={formatDate(data.createdAt)} />
            </dl>
          </Card>

          <ContactsCard partner={data} onChanged={() => void partner.refetch()} />

          <Attachments entity="PARTNER" entityId={data.id} />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          {can(P.quotesRead) && (
            <DocumentsCard
              title="Devis"
              icon={<FileSignature size={24} />}
              items={data.quotes}
              to="/devis"
              renderStatus={(status) => <StatusBadge status={status} flow={QUOTE_FLOW} />}
            />
          )}

          {can(P.ordersRead) && (
            <DocumentsCard
              title="Commandes"
              icon={<FileText size={24} />}
              items={data.orders}
              to="/commandes"
              renderStatus={(status) => <StatusBadge status={status} flow={ORDER_FLOW} />}
            />
          )}

          {can(P.invoicesRead) && (
            <DocumentsCard
              title="Factures"
              icon={<Receipt size={24} />}
              items={data.invoices}
              to="/factures"
              renderStatus={(status) => <StatusBadge status={status} flow={INVOICE_FLOW} />}
            />
          )}

          {can(P.opportunitiesRead) && data.opportunities.length > 0 && (
            <Card>
              <CardHeader title="Opportunités" subtitle="Affaires en cours ou closes" />
              <ul className="divide-y divide-[var(--border)]">
                {data.opportunities.map((opportunity) => (
                  <li
                    key={opportunity.id}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px]"
                  >
                    <Target size={14} className="shrink-0 text-ink-3" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-ink">{opportunity.name}</span>
                    <span className="shrink-0 text-ink-3">{STAGE_LABEL[opportunity.stage]}</span>
                    <span className="shrink-0 font-medium tabular-nums text-ink">
                      {money(opportunity.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {can(P.activitiesRead) && data.activities.length > 0 && (
            <Card>
              <CardHeader title="Activités" subtitle="Échanges rattachés à ce tiers" />
              <ul className="divide-y divide-[var(--border)]">
                {data.activities.map((activity) => (
                  <li
                    key={activity.id}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px]"
                  >
                    <CalendarCheck size={14} className="shrink-0 text-ink-3" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-ink">{activity.subject}</span>
                    <span className="shrink-0 text-ink-3">
                      {ACTIVITY_TYPE_LABEL[activity.type]}
                    </span>
                    <span className="shrink-0 tabular-nums text-ink-3">
                      {formatDate(activity.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-4 py-2">
      <dt className="flex items-center gap-1.5 text-[13px] text-ink-3">
        {icon}
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right text-[13px] text-ink">{value || '—'}</dd>
    </div>
  );
}

/** Bloc générique pour les trois listes de documents de la fiche. */
function DocumentsCard<S extends string>({
  title,
  icon,
  items,
  to,
  renderStatus,
}: {
  title: string;
  icon: ReactNode;
  items: { id: number; ref: string; status: S; date: string; totalTTC: number }[];
  to: string;
  renderStatus: (status: S) => ReactNode;
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={`${items.length} document(s) récent(s)`}
        action={
          <Link to={to} className="text-[13px] font-medium text-accent hover:underline">
            Tout voir
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState icon={icon} title={`Aucun document`} />
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
              <span className="w-28 shrink-0 font-medium text-ink">{item.ref}</span>
              <span className="shrink-0">{renderStatus(item.status)}</span>
              <span className="ml-auto shrink-0 tabular-nums text-ink-3">
                {formatDate(item.date)}
              </span>
              <span className="w-24 shrink-0 text-right font-medium tabular-nums text-ink">
                {money(item.totalTTC, true)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** Interlocuteurs du tiers : la partie qui n'avait aucune interface. */
function ContactsCard({
  partner,
  onChanged,
}: {
  partner: PartnerDetail;
  onChanged: () => void;
}) {
  const { can } = useAuth();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState<Contact | null>(null);

  const remove = useWrite<number>(
    async (contactId) =>
      (await api.delete(`/partners/${partner.id}/contacts/${contactId}`)).data,
    { invalidate: [['partners']], success: 'Contact supprimé' },
  );

  const setPrimary = useWrite<number>(
    async (contactId) =>
      (await api.patch(`/partners/${partner.id}/contacts/${contactId}`, { isPrimary: true }))
        .data,
    { invalidate: [['partners']], success: 'Contact principal mis à jour' },
  );

  return (
    <Card>
      <CardHeader
        title="Contacts"
        subtitle={`${partner.contacts.length} interlocuteur(s)`}
        action={
          can(P.partnersUpdate) && (
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
              Ajouter
            </Button>
          )
        }
      />

      {partner.contacts.length === 0 ? (
        <EmptyState
          icon={<UserRound size={24} />}
          title="Aucun contact"
          description="Ajoutez les interlocuteurs de ce tiers."
        />
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {partner.contacts.map((contact) => (
            <li key={contact.id} className="group flex items-start gap-2.5 px-4 py-2.5">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
                {initials(`${contact.firstName ?? ''} ${contact.lastName}`)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                  <span className="truncate">
                    {[contact.firstName, contact.lastName].filter(Boolean).join(' ')}
                  </span>
                  {contact.isPrimary && <Badge tone="accent">Principal</Badge>}
                </p>
                {contact.role && <p className="text-xs text-ink-3">{contact.role}</p>}
                {contact.email && (
                  <p className="truncate text-xs text-ink-3">{contact.email}</p>
                )}
                {contact.phone && <p className="text-xs text-ink-3">{contact.phone}</p>}
              </div>

              {can(P.partnersUpdate) && (
                <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  {!contact.isPrimary && (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Définir ${contact.lastName} comme contact principal`}
                      onClick={() => setPrimary.mutate(contact.id, { onSuccess: onChanged })}
                      icon={<Star size={13} />}
                    />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Modifier ${contact.lastName}`}
                    onClick={() => setEditing(contact)}
                    icon={<UserRound size={13} />}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Supprimer ${contact.lastName}`}
                    onClick={() => setDeleting(contact)}
                    icon={<Trash2 size={13} />}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ContactForm
        open={creating || editing !== null}
        partnerId={partner.id}
        contact={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={onChanged}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer ce contact ?"
        message={`${deleting?.firstName ?? ''} ${deleting?.lastName ?? ''} sera retiré de la fiche.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              setDeleting(null);
              onChanged();
            },
          })
        }
      />
    </Card>
  );
}

function ContactForm({
  open,
  partnerId,
  contact,
  onClose,
  onSaved,
}: {
  open: boolean;
  partnerId: number;
  contact: Contact | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    phone: '',
  });
  const [seeded, setSeeded] = useState<number | 'new' | null>(null);

  // Réamorçage à l'ouverture, sans effet : le rendu suivant utilise l'état à jour.
  const target = contact?.id ?? 'new';
  if (open && seeded !== target) {
    setSeeded(target);
    setForm({
      firstName: contact?.firstName ?? '',
      lastName: contact?.lastName ?? '',
      role: contact?.role ?? '',
      email: contact?.email ?? '',
      phone: contact?.phone ?? '',
    });
  }
  if (!open && seeded !== null) setSeeded(null);

  const save = useWrite<Record<string, unknown>>(
    async (body) =>
      contact
        ? (await api.patch(`/partners/${partnerId}/contacts/${contact.id}`, body)).data
        : (await api.post(`/partners/${partnerId}/contacts`, body)).data,
    { invalidate: [['partners']], success: 'Contact enregistré' },
  );

  const update = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = Object.fromEntries(
      Object.entries(form).filter(([, value]) => value !== ''),
    );
    save.mutate(body, {
      onSuccess: () => {
        onSaved();
        onClose();
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? 'Modifier le contact' : 'Nouveau contact'}
      width="sm"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={save.isPending} form="contact-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="contact-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2">
        <Input label="Prénom" value={form.firstName} onChange={update('firstName')} />
        <Input label="Nom" required value={form.lastName} onChange={update('lastName')} />
        <div className="sm:col-span-2">
          <Input
            label="Fonction"
            placeholder="Directeur achats, comptabilité…"
            value={form.role}
            onChange={update('role')}
          />
        </div>
        <div className="sm:col-span-2">
          <Input label="E-mail" type="email" value={form.email} onChange={update('email')} />
        </div>
        <div className="sm:col-span-2">
          <Input label="Téléphone" value={form.phone} onChange={update('phone')} />
        </div>
      </form>
    </Modal>
  );
}
