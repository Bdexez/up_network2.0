import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Pencil, Plus, Receipt, Trash2, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../../lib/api';
import { useList, useWrite } from '../../lib/hooks';
import { formatDate, money } from '../../lib/format';
import { ORDER_FLOW } from '../../lib/documents';
import { P } from '../../lib/permissions';
import type {
  Order,
  OrderStatus,
  Partner,
  Product,
  Warehouse,
} from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import {
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../../components/ui/Table';
import { DocumentFormModal } from '../../components/documents/DocumentFormModal';
import { DocumentLines } from '../../components/documents/DocumentLines';
import { DocumentTotals } from '../../components/documents/DocumentTotals';
import { StatusActions } from '../../components/documents/StatusActions';
import { StatusBadge } from '../../components/documents/StatusBadge';
import { toDraftLines } from '../../components/documents/LineEditor';

export function OrdersPage() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [shipping, setShipping] = useState<Order | null>(null);

  const orders = useList<Order>(['orders'], '/orders', status ? { status } : undefined);
  const partners = useList<Partner>(['partners'], '/partners');
  const products = useList<Product>(['products'], '/products');

  const detail = useQuery({
    queryKey: ['orders', 'detail', openId ?? editingId],
    queryFn: async () => (await api.get<Order>(`/orders/${openId ?? editingId}`)).data,
    enabled: openId !== null || editingId !== null,
  });

  const save = useWrite<{ id?: number; body: Record<string, unknown> }>(
    async ({ id, body }) =>
      id
        ? (await api.patch(`/orders/${id}`, body)).data
        : (await api.post('/orders', body)).data,
    { invalidate: [['orders'], ['dashboard']], success: 'Commande enregistrée' },
  );

  const changeStatus = useWrite<{ id: number; status: OrderStatus }>(
    async ({ id, status: next }) =>
      (await api.patch(`/orders/${id}/status`, { status: next })).data,
    { invalidate: [['orders'], ['dashboard']], success: 'Statut mis à jour' },
  );

  const invoice = useWrite<number>(
    async (id) => (await api.post(`/orders/${id}/invoice`)).data,
    {
      invalidate: [['orders'], ['invoices'], ['dashboard']],
      success: 'Facture créée',
    },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/orders/${id}`)).data,
    { invalidate: [['orders'], ['dashboard']], success: 'Commande supprimée' },
  );

  const closeForm = () => {
    setCreating(false);
    setEditingId(null);
  };

  const editing = editingId !== null ? detail.data : undefined;

  // Mémorisé : sans cela, l'objet serait recréé à chaque rendu du parent et
  // le formulaire se réinitialiserait au moindre rafraîchissement de requête.
  const initialValues = useMemo(
    () =>
      editing
        ? {
            partnerId: String(editing.partnerId),
            date: editing.date.slice(0, 10),
            secondaryDate: editing.deliveryDate?.slice(0, 10) ?? '',
            notes: editing.notes ?? '',
            lines: toDraftLines(editing.lines),
          }
        : undefined,
    [editing],
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Commandes"
        description="Commandes clients : validation, expédition puis facturation."
        actions={
          <>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filtrer par statut"
              className="h-9 cursor-pointer rounded-lg border border-line bg-raised px-3 text-sm text-ink hover:border-line-strong focus:border-accent"
            >
              <option value="">Tous les statuts</option>
              {ORDER_FLOW.order.map((value) => (
                <option key={value} value={value}>
                  {ORDER_FLOW.meta[value].label}
                </option>
              ))}
            </select>
            {can(P.ordersCreate) && (
              <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                Nouvelle commande
              </Button>
            )}
          </>
        }
      />

      <Card>
        {orders.isLoading ? (
          <Spinner />
        ) : orders.isError ? (
          <ErrorState message={errorMessage(orders.error)} onRetry={() => void orders.refetch()} />
        ) : (orders.data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<FileText size={26} />}
            title={status ? 'Aucun résultat' : 'Aucune commande'}
            description={
              status
                ? 'Aucune commande dans ce statut.'
                : 'Créez une commande, ou convertissez un devis signé.'
            }
            action={
              !status && can(P.ordersCreate) ? (
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Nouvelle commande
                </Button>
              ) : undefined
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Référence</Th>
                <Th>Client</Th>
                <Th>Statut</Th>
                <Th align="right">Total HT</Th>
                <Th align="right">Total TTC</Th>
                <Th align="right">Date</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {orders.data?.map((order) => (
                <Tr key={order.id} onClick={() => setOpenId(order.id)}>
                  <Td className="font-medium text-ink">
                    {order.ref}
                    {order.quote && (
                      <span className="block text-[11px] text-ink-3">
                        depuis {order.quote.ref}
                      </span>
                    )}
                  </Td>
                  <Td>{order.partner.name}</Td>
                  <Td>
                    <StatusBadge status={order.status} flow={ORDER_FLOW} />
                  </Td>
                  <Td align="right" numeric>
                    {money(order.totalHT, true)}
                  </Td>
                  <Td align="right" numeric className="font-medium text-ink">
                    {money(order.totalTTC, true)}
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(order.date)}
                  </Td>
                  <Td align="right">
                    <div
                      className="flex justify-end gap-1"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {order.status === 'VALIDATED' && can(P.ordersUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Truck size={14} />}
                          onClick={() => setShipping(order)}
                        >
                          Expédier
                        </Button>
                      )}
                      {['VALIDATED', 'SHIPPED'].includes(order.status) &&
                        order.invoices.length === 0 &&
                        can(P.invoicesCreate) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Receipt size={14} />}
                            loading={invoice.isPending && invoice.variables === order.id}
                            onClick={() =>
                              invoice.mutate(order.id, {
                                onSuccess: () => navigate('/factures'),
                              })
                            }
                          >
                            Facturer
                          </Button>
                        )}
                      {ORDER_FLOW.editable.includes(order.status) && can(P.ordersUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Modifier ${order.ref}`}
                          onClick={() => setEditingId(order.id)}
                          icon={<Pencil size={14} />}
                        />
                      )}
                      {ORDER_FLOW.editable.includes(order.status) && can(P.ordersDelete) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Supprimer ${order.ref}`}
                          onClick={() => setDeleting(order)}
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

      <DocumentFormModal
        open={creating || editingId !== null}
        title={editing ? `Modifier la commande ${editing.ref}` : 'Nouvelle commande'}
        partnerLabel="Client"
        secondaryDateLabel="Livraison prévue"
        partners={(partners.data ?? []).filter((p) => p.isActive && p.type !== 'SUPPLIER')}
        products={products.data ?? []}
        loading={save.isPending}
        initial={initialValues}
        onClose={closeForm}
        onSubmit={(payload) =>
          save.mutate(
            {
              id: editingId ?? undefined,
              body: {
                partnerId: payload.partnerId,
                date: payload.date,
                deliveryDate: payload.secondaryDate,
                notes: payload.notes,
                lines: payload.lines,
              },
            },
            { onSuccess: closeForm },
          )
        }
      />

      <Modal
        open={openId !== null}
        onClose={() => setOpenId(null)}
        title={detail.data?.ref ?? 'Commande'}
        description={detail.data?.partner.name}
        width="lg"
        footer={
          detail.data && can(P.ordersUpdate) ? (
            <StatusActions
              status={detail.data.status}
              flow={ORDER_FLOW}
              disabled={changeStatus.isPending}
              onChange={(next) =>
                changeStatus.mutate(
                  { id: detail.data!.id, status: next },
                  { onSuccess: () => void detail.refetch() },
                )
              }
            />
          ) : undefined
        }
      >
        {detail.isLoading || !detail.data ? (
          <Spinner />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-2">
              <StatusBadge status={detail.data.status} flow={ORDER_FLOW} />
              <span>Passée le {formatDate(detail.data.date)}</span>
              {detail.data.shippedAt && (
                <span className="text-ink-3">
                  · expédiée le {formatDate(detail.data.shippedAt)}
                </span>
              )}
            </div>

            <DocumentLines lines={detail.data.lines} />

            <div className="flex justify-end">
              <DocumentTotals
                totalHT={detail.data.totalHT}
                totalVat={detail.data.totalVat}
                totalTTC={detail.data.totalTTC}
                vatBreakdown={detail.data.vatBreakdown}
              />
            </div>

            {detail.data.invoices.length > 0 && (
              <p className="text-[13px] text-ink-3">
                Facturée : {detail.data.invoices.map((i) => i.ref).join(', ')}.
              </p>
            )}
            {detail.data.notes && (
              <p className="rounded-lg bg-sunken px-3 py-2 text-[13px] text-ink-2">
                {detail.data.notes}
              </p>
            )}
          </div>
        )}
      </Modal>

      <ShipDialog order={shipping} onClose={() => setShipping(null)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette commande ?"
        message={`La commande ${deleting?.ref} et ses lignes seront supprimées.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

/** L'expédition demande l'entrepôt à décrémenter avant de sortir le stock. */
function ShipDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const warehouses = useList<Warehouse>(['warehouses'], '/stock/warehouses');
  const [warehouseId, setWarehouseId] = useState('');

  const ship = useWrite<{ id: number; warehouseId?: number }>(
    async ({ id, warehouseId: warehouse }) =>
      (await api.post(`/orders/${id}/ship`, warehouse ? { warehouseId: warehouse } : {})).data,
    {
      invalidate: [['orders'], ['stock'], ['dashboard']],
      success: 'Commande expédiée, stock mis à jour',
    },
  );

  return (
    <Modal
      open={order !== null}
      onClose={onClose}
      title="Expédier la commande"
      description={
        order
          ? `${order.ref} — les quantités des produits suivis sortiront du stock.`
          : undefined
      }
      width="sm"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            loading={ship.isPending}
            onClick={() =>
              order &&
              ship.mutate(
                { id: order.id, warehouseId: warehouseId ? Number(warehouseId) : undefined },
                { onSuccess: onClose },
              )
            }
          >
            Expédier
          </Button>
        </>
      }
    >
      <Select
        label="Entrepôt"
        hint="À défaut, l'entrepôt par défaut de la société est utilisé."
        value={warehouseId}
        onChange={(event) => setWarehouseId(event.target.value)}
      >
        <option value="">Entrepôt par défaut</option>
        {warehouses.data
          ?.filter((warehouse) => warehouse.isActive)
          .map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
      </Select>
    </Modal>
  );
}
