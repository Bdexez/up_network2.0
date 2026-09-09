import { useState, type FormEvent } from 'react';
import { Contact, Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useDebounced, usePage, usePagination, useWrite } from '../lib/hooks';
import { formatDate } from '../lib/format';
import { PARTNER_TYPE_LABEL } from '../lib/labels';
import { P } from '../lib/permissions';
import type { Partner, PartnerType } from '../lib/types';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Field';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';

const EMPTY = {
  name: '',
  type: 'CUSTOMER' as PartnerType,
  email: '',
  phone: '',
  address: '',
  zipCode: '',
  city: '',
  country: '',
  website: '',
  vatNumber: '',
  paymentTermsDays: '',
};

export function PartnersPage() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Partner | null>(null);

  const pagination = usePagination();
  const partners = usePage<Partner>(['partners'], '/partners', {
    ...pagination.params,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const save = useWrite<{ id?: number; body: typeof EMPTY }>(
    async ({ id, body }) => {
      const payload: Record<string, unknown> = Object.fromEntries(
        Object.entries(body).filter(([, value]) => value !== ''),
      );
      if (body.paymentTermsDays !== '') {
        payload.paymentTermsDays = Number(body.paymentTermsDays);
      }
      if (id) return (await api.patch(`/partners/${id}`, payload)).data;
      return (await api.post('/partners', payload)).data;
    },
    { invalidate: [['partners'], ['dashboard']], success: 'Client enregistré' },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/partners/${id}`)).data,
    { invalidate: [['partners'], ['dashboard']], success: 'Client supprimé' },
  );

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
  };

  const formOpen = creating || editing !== null;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Clients"
        description="Vos clients et fournisseurs."
        actions={
          <>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                pagination.reset();
              }}
              placeholder="Nom, e-mail, ville, TVA…"
            />
            {can(P.partnersCreate) && (
              <Button
                variant="primary"
                icon={<Plus size={15} />}
                onClick={() => setCreating(true)}
              >
                Nouveau client
              </Button>
            )}
          </>
        }
      />

      <Card>
        {partners.isLoading ? (
          <Spinner />
        ) : partners.isError ? (
          <ErrorState
            message={String(partners.error)}
            onRetry={() => void partners.refetch()}
          />
        ) : partners.items.length === 0 ? (
          <EmptyState
            icon={<Contact size={26} />}
            title={search ? 'Aucun résultat' : 'Aucun client'}
            description={
              search
                ? 'Aucun client ne correspond à cette recherche.'
                : 'Créez votre premier client pour commencer à enregistrer des commandes.'
            }
            action={
              !search && can(P.partnersCreate) ? (
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Nouveau client
                </Button>
              ) : undefined
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Nom</Th>
                <Th>Type</Th>
                <Th>Contact</Th>
                <Th>Ville</Th>
                <Th align="right">Documents</Th>
                <Th align="right">Créé le</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {partners.items.map((partner) => (
                <Tr key={partner.id} onClick={() => navigate(`/clients/${partner.id}`)}>
                  <Td>
                    <span className="font-medium text-ink">{partner.name}</span>
                    {!partner.isActive && (
                      <span className="ml-2">
                        <Badge tone="neutral">Archivé</Badge>
                      </span>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={partner.type === 'SUPPLIER' ? 'neutral' : 'accent'}>
                      {PARTNER_TYPE_LABEL[partner.type]}
                    </Badge>
                  </Td>
                  <Td>
                    <span className="block truncate">{partner.email ?? '—'}</span>
                    {partner.phone && (
                      <span className="block text-xs text-ink-3">{partner.phone}</span>
                    )}
                  </Td>
                  <Td>{partner.city ?? '—'}</Td>
                  <Td align="right" numeric>
                    {(partner._count?.quotes ?? 0) +
                      (partner._count?.orders ?? 0) +
                      (partner._count?.invoices ?? 0)}
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(partner.createdAt)}
                  </Td>
                  <Td align="right">
                    <div
                      className="flex justify-end gap-1"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {can(P.partnersUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Modifier ${partner.name}`}
                          onClick={() => setEditing(partner)}
                          icon={<Pencil size={14} />}
                        />
                      )}
                      {can(P.partnersDelete) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Supprimer ${partner.name}`}
                          onClick={() => setDeleting(partner)}
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
          page={partners.page}
          totalPages={partners.totalPages}
          total={partners.total}
          perPage={pagination.perPage}
          onChange={pagination.setPage}
          label="tiers"
        />
      </Card>

      <PartnerForm
        open={formOpen}
        partner={editing}
        loading={save.isPending}
        onClose={closeForm}
        onSubmit={(body) =>
          save.mutate(
            { id: editing?.id, body },
            { onSuccess: closeForm },
          )
        }
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer ce client ?"
        message={`« ${deleting?.name} » sera supprimé. S'il a déjà des commandes, il sera archivé pour préserver l'historique.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

function PartnerForm({
  open,
  partner,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  partner: Partner | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (body: typeof EMPTY) => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const [seeded, setSeeded] = useState<number | 'new' | null>(null);

  // Réamorce le formulaire à chaque ouverture / changement de cible.
  const target = partner?.id ?? 'new';
  if (open && seeded !== target) {
    setSeeded(target);
    setForm(
      partner
        ? {
            name: partner.name,
            type: partner.type,
            email: partner.email ?? '',
            phone: partner.phone ?? '',
            address: partner.address ?? '',
            zipCode: partner.zipCode ?? '',
            city: partner.city ?? '',
            country: partner.country ?? '',
            website: partner.website ?? '',
            vatNumber: partner.vatNumber ?? '',
            paymentTermsDays:
              partner.paymentTermsDays === null ? '' : String(partner.paymentTermsDays),
          }
        : EMPTY,
    );
  }
  if (!open && seeded !== null) setSeeded(null);

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
      title={partner ? 'Modifier le client' : 'Nouveau client'}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={loading} form="partner-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="partner-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Nom" required value={form.name} onChange={update('name')} />
        </div>
        <Select label="Type" value={form.type} onChange={update('type')}>
          {(Object.keys(PARTNER_TYPE_LABEL) as PartnerType[]).map((type) => (
            <option key={type} value={type}>
              {PARTNER_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
        <Input label="Téléphone" value={form.phone} onChange={update('phone')} />
        <div className="sm:col-span-2">
          <Input label="E-mail" type="email" value={form.email} onChange={update('email')} />
        </div>
        <div className="sm:col-span-2">
          <Input label="Adresse" value={form.address} onChange={update('address')} />
        </div>
        <Input label="Code postal" value={form.zipCode} onChange={update('zipCode')} />
        <Input label="Ville" value={form.city} onChange={update('city')} />
        <Input label="Pays" value={form.country} onChange={update('country')} />
        <Input
          label="N° TVA"
          hint="Repris sur les factures"
          value={form.vatNumber}
          onChange={update('vatNumber')}
        />
        <Input
          label="Délai de règlement (jours)"
          type="number"
          min="0"
          max="365"
          hint="Vide = délai de la société"
          value={form.paymentTermsDays}
          onChange={update('paymentTermsDays')}
        />
        <div className="sm:col-span-2">
          <Input label="Site web" value={form.website} onChange={update('website')} />
        </div>
      </form>
    </Modal>
  );
}
