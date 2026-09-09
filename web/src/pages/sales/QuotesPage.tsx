import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRightLeft,
  Download,
  FileSignature,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../../lib/api';
import { useList, usePage, usePagination, useWrite } from '../../lib/hooks';
import { useFileDownload } from '../../lib/download';
import { formatDate, money } from '../../lib/format';
import { QUOTE_FLOW } from '../../lib/documents';
import { P } from '../../lib/permissions';
import type { PartnerOption, ProductOption, Quote, QuoteStatus } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
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
import { toDraftLines } from '../../components/documents/LineEditor';
import { Attachments } from '../../components/documents/Attachments';

export function QuotesPage() {
  const { can, user } = useAuth();
  const companyCurrency = user?.company?.currency ?? 'EUR';
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Quote | null>(null);

  const pdf = useFileDownload();
  const pagination = usePagination();
  const quotes = usePage<Quote>(['quotes'], '/quotes', {
    ...pagination.params,
    ...(status ? { status } : {}),
  });
  const partners = useList<PartnerOption>(['partner-options', 'customer'], '/partners/options', {
    type: 'CUSTOMER',
  });
  const products = useList<ProductOption>(['product-options'], '/products/options');

  const detail = useQuery({
    queryKey: ['quotes', 'detail', openId ?? editingId],
    queryFn: async () =>
      (await api.get<Quote>(`/quotes/${openId ?? editingId}`)).data,
    enabled: openId !== null || editingId !== null,
  });

  const save = useWrite<{ id?: number; body: Record<string, unknown> }>(
    async ({ id, body }) =>
      id
        ? (await api.patch(`/quotes/${id}`, body)).data
        : (await api.post('/quotes', body)).data,
    { invalidate: [['quotes'], ['dashboard']], success: 'Devis enregistré' },
  );

  const changeStatus = useWrite<{ id: number; status: QuoteStatus }>(
    async ({ id, status: next }) =>
      (await api.patch(`/quotes/${id}/status`, { status: next })).data,
    { invalidate: [['quotes'], ['dashboard']], success: 'Statut mis à jour' },
  );

  const convert = useWrite<number>(
    async (id) => (await api.post(`/quotes/${id}/convert`)).data,
    { invalidate: [['quotes'], ['orders'], ['dashboard']], success: 'Commande créée' },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/quotes/${id}`)).data,
    { invalidate: [['quotes'], ['dashboard']], success: 'Devis supprimé' },
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
            secondaryDate: editing.validUntil?.slice(0, 10) ?? '',
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
        title="Devis"
        description="Propositions commerciales, converties en commande une fois signées."
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
              {QUOTE_FLOW.order.map((value) => (
                <option key={value} value={value}>
                  {QUOTE_FLOW.meta[value].label}
                </option>
              ))}
            </select>
            {can(P.quotesCreate) && (
              <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                Nouveau devis
              </Button>
            )}
          </>
        }
      />

      <Card>
        {quotes.isLoading ? (
          <Spinner />
        ) : quotes.isError ? (
          <ErrorState message={errorMessage(quotes.error)} onRetry={() => void quotes.refetch()} />
        ) : quotes.items.length === 0 ? (
          <EmptyState
            icon={<FileSignature size={26} />}
            title={status ? 'Aucun résultat' : 'Aucun devis'}
            description={
              status
                ? 'Aucun devis dans ce statut.'
                : 'Établissez une proposition commerciale, puis convertissez-la en commande.'
            }
            action={
              !status && can(P.quotesCreate) ? (
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Nouveau devis
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
                <Th align="right">Validité</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {quotes.items.map((quote) => (
                <Tr key={quote.id} onClick={() => setOpenId(quote.id)}>
                  <Td className="font-medium text-ink">{quote.ref}</Td>
                  <Td>{quote.partner.name}</Td>
                  <Td>
                    <StatusBadge status={quote.status} flow={QUOTE_FLOW} />
                  </Td>
                  <Td align="right" numeric>
                    {money(quote.totalHT, true, quote.currency)}
                  </Td>
                  <Td align="right" numeric className="font-medium text-ink">
                    {money(quote.totalTTC, true, quote.currency)}
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(quote.date)}
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(quote.validUntil)}
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
                        loading={pdf.pendingId === quote.id}
                        onClick={() =>
                          void pdf.download(
                            `/quotes/${quote.id}/pdf`,
                            `${quote.ref}.pdf`,
                            quote.id,
                          )
                        }
                      >
                        PDF
                      </Button>
                      {quote.status === 'SIGNED' && can(P.ordersCreate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<ArrowRightLeft size={14} />}
                          loading={convert.isPending && convert.variables === quote.id}
                          onClick={() =>
                            convert.mutate(quote.id, {
                              onSuccess: () => navigate('/commandes'),
                            })
                          }
                        >
                          Convertir
                        </Button>
                      )}
                      {QUOTE_FLOW.editable.includes(quote.status) && can(P.quotesUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Modifier ${quote.ref}`}
                          onClick={() => setEditingId(quote.id)}
                          icon={<Pencil size={14} />}
                        />
                      )}
                      {QUOTE_FLOW.editable.includes(quote.status) && can(P.quotesDelete) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Supprimer ${quote.ref}`}
                          onClick={() => setDeleting(quote)}
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
          page={quotes.page}
          totalPages={quotes.totalPages}
          total={quotes.total}
          perPage={pagination.perPage}
          onChange={pagination.setPage}
          label="devis"
        />
      </Card>

      <DocumentFormModal
        open={creating || editingId !== null}
        title={editing ? `Modifier le devis ${editing.ref}` : 'Nouveau devis'}
        partnerLabel="Client"
        secondaryDateLabel="Valable jusqu'au"
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
                validUntil: payload.secondaryDate,
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
        title={detail.data?.ref ?? 'Devis'}
        description={detail.data?.partner.name}
        width="lg"
        footer={
          detail.data && can(P.quotesUpdate) ? (
            <StatusActions
              status={detail.data.status}
              flow={QUOTE_FLOW}
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
              <StatusBadge status={detail.data.status} flow={QUOTE_FLOW} />
              <span>Émis le {formatDate(detail.data.date)}</span>
              {detail.data.validUntil && (
                <span className="text-ink-3">
                  · valable jusqu'au {formatDate(detail.data.validUntil)}
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

            <Attachments entity="QUOTE" entityId={detail.data.id} />

            {detail.data.orders.length > 0 && (
              <p className="text-[13px] text-ink-3">
                Converti en commande {detail.data.orders.map((o) => o.ref).join(', ')}.
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

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer ce devis ?"
        message={`Le devis ${deleting?.ref} et ses lignes seront supprimés.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}
