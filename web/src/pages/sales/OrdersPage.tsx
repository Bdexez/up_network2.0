import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  FileText,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  Truck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../../lib/api';
import { useList, usePage, usePagination, useWrite } from '../../lib/hooks';
import { useFileDownload } from '../../lib/download';
import { formatDate, money } from '../../lib/format';
import { ORDER_FLOW } from '../../lib/documents';
import { P } from '../../lib/permissions';
import type {
  Order,
  OrderStatus,
  PartnerOption,
  ProductOption,
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
import { Pagination } from '../../components/ui/Pagination';
import { DocumentFormModal } from '../../components/documents/DocumentFormModal';
import { DocumentLines } from '../../components/documents/DocumentLines';
import { DocumentTotals } from '../../components/documents/DocumentTotals';
import { StatusActions } from '../../components/documents/StatusActions';
import { StatusBadge } from '../../components/documents/StatusBadge';
import { FulfilLinesDialog } from '../../components/documents/FulfilLinesDialog';
import { toDraftLines } from '../../components/documents/LineEditor';
import { Attachments } from '../../components/documents/Attachments';

export function OrdersPage() {
  const { can, user } = useAuth();
  const companyCurrency = user?.company?.currency ?? 'EUR';
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [fulfilling, setFulfilling] = useState<{
    id: number;
    dimension: 'shipped' | 'invoiced';
  } | null>(null);

  const pdf = useFileDownload();
  const pagination = usePagination();
  const orders = usePage<Order>(['orders'], '/orders', {
    ...pagination.params,
    ...(status ? { status } : {}),
  });
  const partners = useList<PartnerOption>(['partner-options', 'customer'], '/partners/options', {
    type: 'CUSTOMER',
  });
  const products = useList<ProductOption>(['product-options'], '/products/options');

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
            version: editing.version,
            currency: editing.currency,
            exchangeRate: String(editing.exchangeRate),
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
              onChange={(event) => {
                setStatus(event.target.value);
                pagination.reset();
              }}
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
        ) : orders.items.length === 0 ? (
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
              {orders.items.map((order) => (
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
                    {money(order.totalHT, true, order.currency)}
                  </Td>
                  <Td align="right" numeric className="font-medium text-ink">
                    {money(order.totalTTC, true, order.currency)}
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(order.date)}
                  </Td>
                  <Td align="right">
                    <div
                      className="flex justify-end gap-1"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Download size={14} />}
                        loading={pdf.pendingId === order.id}
                        onClick={() =>
                          void pdf.download(
                            `/orders/${order.id}/pdf`,
                            `${order.ref}.pdf`,
                            order.id,
                          )
                        }
                      >
                        PDF
                      </Button>
                      {order.status === 'VALIDATED' && can(P.ordersUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Truck size={14} />}
                          onClick={() =>
                            setFulfilling({ id: order.id, dimension: 'shipped' })
                          }
                        >
                          Expédier
                        </Button>
                      )}
                      {['VALIDATED', 'SHIPPED'].includes(order.status) &&
                        can(P.invoicesCreate) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Receipt size={14} />}
                            onClick={() =>
                              setFulfilling({ id: order.id, dimension: 'invoiced' })
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

        <Pagination
          page={orders.page}
          totalPages={orders.totalPages}
          total={orders.total}
          perPage={pagination.perPage}
          onChange={pagination.setPage}
          label="commandes"
        />
      </Card>

      <DocumentFormModal
        open={creating || editingId !== null}
        title={editing ? `Modifier la commande ${editing.ref}` : 'Nouvelle commande'}
        partnerLabel="Client"
        secondaryDateLabel="Livraison prévue"
        partners={partners.data ?? []}
        products={products.data ?? []}
        companyCurrency={companyCurrency}
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
                version: payload.version,
                currency: payload.currency,
                exchangeRate: payload.exchangeRate,
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
                currency={detail.data.currency}
              />
            </div>

            <Attachments entity="ORDER" entityId={detail.data.id} />

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

      <FulfilDialog
        target={fulfilling}
        onClose={() => setFulfilling(null)}
        onInvoiced={() => navigate('/factures')}
      />

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


/**
 * Expédition ou facturation, totale ou partielle. Les deux gestes partagent
 * la même mécanique : choisir des quantités sur les lignes restantes.
 */
function FulfilDialog({
  target,
  onClose,
  onInvoiced,
}: {
  target: { id: number; dimension: 'shipped' | 'invoiced' } | null;
  onClose: () => void;
  onInvoiced: () => void;
}) {
  const warehouses = useList<Warehouse>(['warehouses'], '/stock/warehouses');
  const [warehouseId, setWarehouseId] = useState('');

  const detail = useQuery({
    queryKey: ['orders', 'detail', target?.id],
    queryFn: async () => (await api.get<Order>(`/orders/${target!.id}`)).data,
    enabled: target !== null,
  });

  const ship = useWrite<{
    id: number;
    warehouseId?: number;
    lines: { lineId: number; quantity: number }[];
  }>(
    async ({ id, warehouseId: warehouse, lines }) =>
      (
        await api.post(`/orders/${id}/ship`, {
          ...(warehouse ? { warehouseId: warehouse } : {}),
          lines,
        })
      ).data,
    {
      invalidate: [['orders'], ['stock'], ['dashboard']],
      success: 'Expédition enregistrée, stock mis à jour',
    },
  );

  const invoice = useWrite<{
    id: number;
    lines: { lineId: number; quantity: number }[];
  }>(
    async ({ id, lines }) => (await api.post(`/orders/${id}/invoice`, { lines })).data,
    { invalidate: [['orders'], ['invoices'], ['dashboard']], success: 'Facture créée' },
  );

  if (!target) return null;

  const shipping = target.dimension === 'shipped';

  return (
    <FulfilLinesDialog
      open
      title={shipping ? 'Expédier la commande' : 'Facturer la commande'}
      description={
        detail.data
          ? shipping
            ? `${detail.data.ref} — les produits suivis sortiront du stock.`
            : `${detail.data.ref} — ajustez les quantités pour une facturation partielle.`
          : undefined
      }
      lines={detail.data?.lines ?? []}
      dimension={target.dimension}
      currency={detail.data?.currency ?? 'EUR'}
      loading={ship.isPending || invoice.isPending}
      confirmLabel={shipping ? 'Expédier' : 'Facturer'}
      extraFields={
        shipping ? (
          <Select
            label="Entrepôt"
            hint="À défaut, l'entrepôt par défaut de la société."
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
        ) : undefined
      }
      onClose={onClose}
      onConfirm={(lines) => {
        if (shipping) {
          ship.mutate(
            {
              id: target.id,
              warehouseId: warehouseId ? Number(warehouseId) : undefined,
              lines,
            },
            { onSuccess: onClose },
          );
        } else {
          invoice.mutate(
            { id: target.id, lines },
            {
              onSuccess: () => {
                onClose();
                onInvoiced();
              },
            },
          );
        }
      }}
    />
  );
}
