import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Star, Trash2, Warehouse as WarehouseIcon } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useList, useWrite } from '../../lib/hooks';
import { count } from '../../lib/format';
import { P } from '../../lib/permissions';
import type { Warehouse } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../../components/ui/Table';

const EMPTY = { name: '', code: '', address: '', city: '', description: '' };

export function WarehousesPage() {
  const { can } = useAuth();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [deleting, setDeleting] = useState<Warehouse | null>(null);

  const warehouses = useList<Warehouse>(['warehouses'], '/stock/warehouses');

  const setDefault = useWrite<number>(
    async (id) => (await api.patch(`/stock/warehouses/${id}`, { isDefault: true })).data,
    { invalidate: [['warehouses']], success: 'Entrepôt par défaut mis à jour' },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/stock/warehouses/${id}`)).data,
    { invalidate: [['warehouses'], ['stock']], success: 'Entrepôt supprimé' },
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Entrepôts"
        description="Les emplacements où le stock est suivi."
        actions={
          can(P.warehousesCreate) && (
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
              Nouvel entrepôt
            </Button>
          )
        }
      />

      <Card>
        {warehouses.isLoading ? (
          <Spinner />
        ) : warehouses.isError ? (
          <ErrorState
            message={errorMessage(warehouses.error)}
            onRetry={() => void warehouses.refetch()}
          />
        ) : (warehouses.data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<WarehouseIcon size={26} />}
            title="Aucun entrepôt"
            description="Créez au moins un entrepôt pour pouvoir mouvementer du stock."
            action={
              can(P.warehousesCreate) ? (
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Nouvel entrepôt
                </Button>
              ) : undefined
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Nom</Th>
                <Th>Code</Th>
                <Th>Ville</Th>
                <Th align="right">Références</Th>
                <Th align="right">Quantité totale</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {warehouses.data?.map((warehouse) => (
                <Tr key={warehouse.id}>
                  <Td>
                    <span className="font-medium text-ink">{warehouse.name}</span>
                    <span className="ml-2 inline-flex gap-1">
                      {warehouse.isDefault && <Badge tone="accent">Par défaut</Badge>}
                      {!warehouse.isActive && <Badge tone="neutral">Désactivé</Badge>}
                    </span>
                  </Td>
                  <Td>
                    <code className="rounded bg-sunken px-1.5 py-0.5 text-xs text-ink-2">
                      {warehouse.code}
                    </code>
                  </Td>
                  <Td>{warehouse.city ?? '—'}</Td>
                  <Td align="right" numeric>
                    {count(warehouse.references)}
                  </Td>
                  <Td align="right" numeric>
                    {count(warehouse.totalQuantity)}
                  </Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1">
                      {!warehouse.isDefault &&
                        warehouse.isActive &&
                        can(P.warehousesUpdate) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Définir ${warehouse.name} par défaut`}
                            onClick={() => setDefault.mutate(warehouse.id)}
                            icon={<Star size={14} />}
                          />
                        )}
                      {can(P.warehousesUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Modifier ${warehouse.name}`}
                          onClick={() => setEditing(warehouse)}
                          icon={<Pencil size={14} />}
                        />
                      )}
                      {can(P.warehousesDelete) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Supprimer ${warehouse.name}`}
                          onClick={() => setDeleting(warehouse)}
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
      </Card>

      <WarehouseForm
        open={creating || editing !== null}
        warehouse={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cet entrepôt ?"
        message={`« ${deleting?.name} » sera supprimé. S'il a déjà des mouvements, il sera désactivé pour préserver l'historique.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

function WarehouseForm({
  open,
  warehouse,
  onClose,
}: {
  open: boolean;
  warehouse: Warehouse | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(
      warehouse
        ? {
            name: warehouse.name,
            code: warehouse.code,
            address: warehouse.address ?? '',
            city: warehouse.city ?? '',
            description: warehouse.description ?? '',
          }
        : EMPTY,
    );
  }, [open, warehouse]);

  const save = useWrite<{ id?: number; body: Record<string, unknown> }>(
    async ({ id, body }) =>
      id
        ? (await api.patch(`/stock/warehouses/${id}`, body)).data
        : (await api.post('/stock/warehouses', body)).data,
    { invalidate: [['warehouses']], success: 'Entrepôt enregistré' },
  );

  const update =
    (key: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = Object.fromEntries(
      Object.entries(form).filter(([, value]) => value !== ''),
    );
    save.mutate({ id: warehouse?.id, body }, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={warehouse ? "Modifier l'entrepôt" : 'Nouvel entrepôt'}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={save.isPending} form="warehouse-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="warehouse-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2">
        <Input label="Nom" required value={form.name} onChange={update('name')} />
        <Input
          label="Code"
          required
          hint="Unique dans votre société"
          value={form.code}
          onChange={update('code')}
        />
        <div className="sm:col-span-2">
          <Input label="Adresse" value={form.address} onChange={update('address')} />
        </div>
        <Input label="Ville" value={form.city} onChange={update('city')} />
        <div className="sm:col-span-2">
          <Textarea
            label="Description"
            rows={2}
            value={form.description}
            onChange={update('description')}
          />
        </div>
      </form>
    </Modal>
  );
}
