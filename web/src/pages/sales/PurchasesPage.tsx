import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackageCheck, Pencil, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useList, useWrite } from '../../lib/hooks';
import { formatDate, money } from '../../lib/format';
import { PURCHASE_FLOW } from '../../lib/documents';
import { P } from '../../lib/permissions';
import type {
  Partner,
  Product,
  PurchaseOrder,
  PurchaseOrderStatus,
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

export function PurchasesPage() {
  const { can } = useAuth();
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<PurchaseOrder | null>(null);
  const [receiving, setReceiving] = useState<PurchaseOrder | null>(null);

  const orders = useList<PurchaseOrder>(
    ['purchases'],
    '/purchases',
    status ? { status } : undefined,
  );
  const partners = useList<Partner>(['partners'], '/partners');
  const products = useList<Product>(['products'], '/products');

  const detail = useQuery({
    queryKey: ['purchases', 'detail', openId ?? editingId],
    queryFn: async () =>
      (await api.get<PurchaseOrder>(`/purchases/${openId ?? editingId}`)).data,
    enabled: openId !== null || editingId !== null,
  });

  const save = useWrite<{ id?: number; body: Record<string, unknown> }>(
    async ({ id, body }) =>
      id
        ? (await api.patch(`/purchases/${id}`, body)).data
        : (await api.post('/purchases', body)).data,
    { invalidate: [['purchases'], ['dashboard']], success: 'Commande enregistrée' },
  );

  const changeStatus = useWrite<{ id: number; status: PurchaseOrderStatus }>(
    async ({ id, status: next }) =>
      (await api.patch(`/purchases/${id}/status`, { status: next })).data,
    { invalidate: [['purchases']], success: 'Statut mis à jour' },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/purchases/${id}`)).data,
    { invalidate: [['purchases']], success: 'Commande supprimée' },
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
            partnerId: String(editing.supplierId),
            date: editing.date.slice(0, 10),
            secondaryDate: editing.expectedDate?.slice(0, 10) ?? '',
            notes: editing.notes ?? '',
            lines: toDraftLines(editing.lines),
          }
        : undefined,
    [editing],
  );
  const suppliers = (partners.data ?? []).filter(
    (partner) => partner.isActive && partner.type !== 'CUSTOMER',
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Achats"
        description="Commandes fournisseur ; la réception entre les quantités en stock."
        actions={
          <>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filtrer par statut"
              className="h-9 cursor-pointer rounded-lg border border-line bg-raised px-3 text-sm text-ink hover:border-line-strong focus:border-accent"
            >
              <option value="">Tous les statuts</option>
              {PURCHASE_FLOW.order.map((value) => (
                <option key={value} value={value}>
                  {PURCHASE_FLOW.meta[value].label}
                </option>
              ))}
            </select>
            {can(P.purchasesCreate) && (
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
            icon={<ShoppingCart size={26} />}
            title={status ? 'Aucun résultat' : 'Aucune commande fournisseur'}
            description={
              status
                ? 'Aucune commande dans ce statut.'
                : 'Commandez auprès de vos fournisseurs ; la réception alimentera le stock.'
            }
            action={
              !status && can(P.purchasesCreate) ? (
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
                <Th>Fournisseur</Th>
                <Th>Statut</Th>
                <Th align="right">Total HT</Th>
                <Th align="right">Total TTC</Th>
                <Th align="right">Attendue</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {orders.data?.map((order) => (
                <Tr key={order.id} onClick={() => setOpenId(order.id)}>
                  <Td className="font-medium text-ink">{order.ref}</Td>
                  <Td>{order.supplier.name}</Td>
                  <Td>
                    <StatusBadge status={order.status} flow={PURCHASE_FLOW} />
                  </Td>
                  <Td align="right" numeric>
                    {money(order.totalHT, true)}
                  </Td>
                  <Td align="right" numeric className="font-medium text-ink">
                    {money(order.totalTTC, true)}
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(order.expectedDate)}
                  </Td>
                  <Td align="right">
                    <div
                      className="flex justify-end gap-1"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {order.status === 'ORDERED' && can(P.purchasesUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<PackageCheck size={14} />}
                          onClick={() => setReceiving(order)}
                        >
                          Réceptionner
                        </Button>
                      )}
                      {PURCHASE_FLOW.editable.includes(order.status) &&
                        can(P.purchasesUpdate) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Modifier ${order.ref}`}
                            onClick={() => setEditingId(order.id)}
                            icon={<Pencil size={14} />}
                          />
                        )}
                      {PURCHASE_FLOW.editable.includes(order.status) &&
                        can(P.purchasesDelete) && (
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
        title={editing ? `Modifier la commande ${editing.ref}` : 'Nouvelle commande fournisseur'}
        partnerLabel="Fournisseur"
        secondaryDateLabel="Réception attendue"
        partners={suppliers}
        products={products.data ?? []}
        loading={save.isPending}
        useCostPrice
        initial={initialValues}
        onClose={closeForm}
        onSubmit={(payload) =>
          save.mutate(
            {
              id: editingId ?? undefined,
              body: {
                supplierId: payload.partnerId,
                date: payload.date,
                expectedDate: payload.secondaryDate,
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
        title={detail.data?.ref ?? 'Commande fournisseur'}
        description={detail.data?.supplier.name}
        width="lg"
        footer={
          detail.data && can(P.purchasesUpdate) ? (
            <StatusActions
              status={detail.data.status}
              flow={PURCHASE_FLOW}
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
              <StatusBadge status={detail.data.status} flow={PURCHASE_FLOW} />
              <span>Passée le {formatDate(detail.data.date)}</span>
              {detail.data.receivedAt && (
                <span className="text-ink-3">
                  · reçue le {formatDate(detail.data.receivedAt)}
                  {detail.data.warehouse ? ` dans ${detail.data.warehouse.name}` : ''}
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
          </div>
        )}
      </Modal>

      <ReceiveDialog order={receiving} onClose={() => setReceiving(null)} />

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

/** La réception demande l'entrepôt à créditer avant d'entrer le stock. */
function ReceiveDialog({
  order,
  onClose,
}: {
  order: PurchaseOrder | null;
  onClose: () => void;
}) {
  const warehouses = useList<Warehouse>(['warehouses'], '/stock/warehouses');
  const [warehouseId, setWarehouseId] = useState('');

  const receive = useWrite<{ id: number; warehouseId?: number }>(
    async ({ id, warehouseId: warehouse }) =>
      (await api.post(`/purchases/${id}/receive`, warehouse ? { warehouseId: warehouse } : {}))
        .data,
    {
      invalidate: [['purchases'], ['stock'], ['dashboard']],
      success: 'Commande réceptionnée, stock mis à jour',
    },
  );

  return (
    <Modal
      open={order !== null}
      onClose={onClose}
      title="Réceptionner la commande"
      description={
        order
          ? `${order.ref} — les quantités des produits suivis entreront en stock.`
          : undefined
      }
      width="sm"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            loading={receive.isPending}
            onClick={() =>
              order &&
              receive.mutate(
                { id: order.id, warehouseId: warehouseId ? Number(warehouseId) : undefined },
                { onSuccess: onClose },
              )
            }
          >
            Réceptionner
          </Button>
        </>
      }
    >
      <Select
        label="Entrepôt"
        hint="À défaut, l'entrepôt de la commande ou celui par défaut."
        value={warehouseId}
        onChange={(event) => setWarehouseId(event.target.value)}
      >
        <option value="">Entrepôt de la commande</option>
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
