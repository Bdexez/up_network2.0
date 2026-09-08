import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  Receipt,
  Trash2,
} from 'lucide-react';
import { api, errorMessage } from '../lib/api';
import { useList, useWrite } from '../lib/hooks';
import { formatDate, money } from '../lib/format';
import { P } from '../lib/permissions';
import type { Order, Partner, Product } from '../lib/types';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../components/ui/Table';

export function OrdersPage() {
  const { can } = useAuth();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const orders = useList<Order>(['orders'], '/orders');

  const invoice = useWrite<number>(
    async (orderId) => (await api.post(`/invoices/generate/${orderId}`)).data,
    { invalidate: [['orders'], ['invoices'], ['dashboard']], success: 'Facture générée' },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/orders/${id}`)).data,
    { invalidate: [['orders'], ['dashboard']], success: 'Commande supprimée' },
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Commandes"
        description="Les commandes clients et leur facturation."
        actions={
          can(P.ordersCreate) && (
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
              Nouvelle commande
            </Button>
          )
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
            title="Aucune commande"
            description="Créez une commande à partir d'un client et de produits du catalogue."
            action={
              can(P.ordersCreate) ? (
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
                <Th className="w-10" />
                <Th>N°</Th>
                <Th>Client</Th>
                <Th align="right">Lignes</Th>
                <Th align="right">Total</Th>
                <Th>Facture</Th>
                <Th align="right">Date</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {orders.data?.map((order) => (
                <Fragment key={order.id}>
                  <Tr
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <Td>
                      {expanded === order.id ? (
                        <ChevronDown size={15} className="text-ink-3" aria-hidden />
                      ) : (
                        <ChevronRight size={15} className="text-ink-3" aria-hidden />
                      )}
                    </Td>
                    <Td className="font-medium text-ink">
                      #{String(order.id).padStart(4, '0')}
                    </Td>
                    <Td>{order.partner.name}</Td>
                    <Td align="right" numeric>
                      {order.items.length}
                    </Td>
                    <Td align="right" numeric className="font-medium text-ink">
                      {money(order.total, true)}
                    </Td>
                    <Td>
                      {order.invoice ? (
                        <Badge tone="good">Facturée</Badge>
                      ) : (
                        <Badge tone="neutral">À facturer</Badge>
                      )}
                    </Td>
                    <Td align="right" numeric>
                      {formatDate(order.createdAt)}
                    </Td>
                    <Td align="right">
                      <div
                        className="flex justify-end gap-1"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {!order.invoice && can(P.invoicesCreate) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Receipt size={14} />}
                            loading={invoice.isPending && invoice.variables === order.id}
                            onClick={() => invoice.mutate(order.id)}
                          >
                            Facturer
                          </Button>
                        )}
                        {!order.invoice && can(P.ordersDelete) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Supprimer la commande ${order.id}`}
                            onClick={() => setDeleting(order)}
                            icon={<Trash2 size={14} />}
                          />
                        )}
                      </div>
                    </Td>
                  </Tr>

                  {expanded === order.id && (
                    <tr>
                      <td colSpan={8} className="border-b border-line bg-sunken px-4 py-3">
                        <ul className="flex flex-col gap-1.5">
                          {order.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-baseline justify-between gap-3 text-[13px]"
                            >
                              <span className="min-w-0 truncate text-ink-2">
                                {item.product.name}
                                <span className="ml-2 text-ink-3">
                                  {item.quantity} × {money(item.price, true)}
                                </span>
                              </span>
                              <span className="shrink-0 font-medium tabular-nums text-ink">
                                {money(item.price * item.quantity, true)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 border-t border-line pt-2 text-xs text-ink-3">
                          Créée par {order.createdBy.username}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <OrderForm open={creating} onClose={() => setCreating(false)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette commande ?"
        message={`La commande #${deleting?.id} et ses lignes seront supprimées définitivement.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

interface DraftLine {
  productId: string;
  quantity: string;
}

function OrderForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const partners = useList<Partner>(['partners'], '/partners');
  const products = useList<Product>(['products'], '/products');

  const [partnerId, setPartnerId] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([{ productId: '', quantity: '1' }]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setPartnerId('');
    setLines([{ productId: '', quantity: '1' }]);
    setError('');
  }, [open]);

  const create = useWrite<{ partnerId: number; items: { productId: number; quantity: number }[] }>(
    async (body) => (await api.post('/orders', body)).data,
    { invalidate: [['orders'], ['dashboard']], success: 'Commande créée' },
  );

  const priceById = useMemo(
    () => new Map((products.data ?? []).map((product) => [product.id, product.price])),
    [products.data],
  );

  // Total estimé côté client ; le serveur recalcule au prix courant du catalogue.
  const total = lines.reduce((acc, line) => {
    const price = priceById.get(Number(line.productId)) ?? 0;
    return acc + price * (Number(line.quantity) || 0);
  }, 0);

  const updateLine = (index: number, patch: Partial<DraftLine>) =>
    setLines((current) =>
      current.map((line, position) => (position === index ? { ...line, ...patch } : line)),
    );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const items = lines
      .filter((line) => line.productId && Number(line.quantity) > 0)
      .map((line) => ({
        productId: Number(line.productId),
        quantity: Number(line.quantity),
      }));

    if (!partnerId) return setError('Choisissez un client.');
    if (items.length === 0) return setError('Ajoutez au moins une ligne valide.');

    create.mutate({ partnerId: Number(partnerId), items }, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle commande"
      description="Les prix sont repris du catalogue au moment de la validation."
      width="lg"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={create.isPending} form="order-form" type="submit">
            Créer la commande
          </Button>
        </>
      }
    >
      <form id="order-form" onSubmit={submit} className="flex flex-col gap-4">
        <Select
          label="Client"
          required
          value={partnerId}
          onChange={(event) => setPartnerId(event.target.value)}
        >
          <option value="">Sélectionner…</option>
          {partners.data
            ?.filter((partner) => partner.isActive)
            .map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
        </Select>

        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium text-ink-2">Lignes</p>

          {lines.map((line, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <Select
                  aria-label={`Produit ligne ${index + 1}`}
                  value={line.productId}
                  onChange={(event) => updateLine(index, { productId: event.target.value })}
                >
                  <option value="">Produit…</option>
                  {products.data?.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {money(product.price, true)}
                    </option>
                  ))}
                </Select>
              </div>
              <input
                type="number"
                min="1"
                step="1"
                aria-label={`Quantité ligne ${index + 1}`}
                value={line.quantity}
                onChange={(event) => updateLine(index, { quantity: event.target.value })}
                className="h-9.5 w-20 rounded-lg border border-line bg-raised px-3 text-sm tabular-nums text-ink hover:border-line-strong focus:border-accent"
              />
              <Button
                variant="ghost"
                aria-label={`Retirer la ligne ${index + 1}`}
                disabled={lines.length === 1}
                onClick={() =>
                  setLines((current) => current.filter((_, position) => position !== index))
                }
                icon={<Trash2 size={15} />}
              />
            </div>
          ))}

          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={14} />}
            className="self-start"
            onClick={() => setLines((current) => [...current, { productId: '', quantity: '1' }])}
          >
            Ajouter une ligne
          </Button>
        </div>

        {error && (
          <p role="alert" className="text-[13px] text-critical">
            {error}
          </p>
        )}

        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-[13px] text-ink-2">Total estimé</span>
          <span className="text-lg font-semibold tabular-nums text-ink">
            {money(total, true)}
          </span>
        </div>
      </form>
    </Modal>
  );
}
