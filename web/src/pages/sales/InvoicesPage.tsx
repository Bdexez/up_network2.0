import { useMemo, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Banknote,
  Download,
  Mail,
  Pencil,
  Plus,
  Receipt,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useList, usePage, usePagination, useWrite } from '../../lib/hooks';
import { useFileDownload } from '../../lib/download';
import { formatDate, money } from '../../lib/format';
import { INVOICE_FLOW, PAYMENT_METHOD_LABEL } from '../../lib/documents';
import { P } from '../../lib/permissions';
import type {
  Invoice,
  MailResult,
  InvoiceStatus,
  PartnerOption,
  PaymentMethod,
  ProductOption,
} from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
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
import { Pagination } from '../../components/ui/Pagination';
import { DocumentFormModal } from '../../components/documents/DocumentFormModal';
import { DocumentLines } from '../../components/documents/DocumentLines';
import { DocumentTotals } from '../../components/documents/DocumentTotals';
import { StatusActions } from '../../components/documents/StatusActions';
import { StatusBadge } from '../../components/documents/StatusBadge';
import { toDraftLines } from '../../components/documents/LineEditor';
import { Attachments } from '../../components/documents/Attachments';

export function InvoicesPage() {
  const { can, user } = useAuth();
  const companyCurrency = user?.company?.currency ?? 'EUR';
  const pdf = useFileDownload();
  const { notify } = useToast();
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Invoice | null>(null);

  const pagination = usePagination();
  const invoices = usePage<Invoice>(['invoices'], '/invoices', {
    ...pagination.params,
    ...(status ? { status } : {}),
  });
  const partners = useList<PartnerOption>(['partner-options', 'customer'], '/partners/options', {
    type: 'CUSTOMER',
  });
  const products = useList<ProductOption>(['product-options'], '/products/options');

  const detail = useQuery({
    queryKey: ['invoices', 'detail', openId ?? editingId],
    queryFn: async () =>
      (await api.get<Invoice>(`/invoices/${openId ?? editingId}`)).data,
    enabled: openId !== null || editingId !== null,
  });

  const save = useWrite<{ id?: number; body: Record<string, unknown> }>(
    async ({ id, body }) =>
      id
        ? (await api.patch(`/invoices/${id}`, body)).data
        : (await api.post('/invoices', body)).data,
    { invalidate: [['invoices'], ['dashboard']], success: 'Facture enregistrée' },
  );

  const changeStatus = useWrite<{ id: number; status: InvoiceStatus }>(
    async ({ id, status: next }) =>
      (await api.patch(`/invoices/${id}/status`, { status: next })).data,
    { invalidate: [['invoices'], ['dashboard']], success: 'Statut mis à jour' },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/invoices/${id}`)).data,
    { invalidate: [['invoices'], ['dashboard']], success: 'Facture supprimée' },
  );

  const sendInvoice = useWrite<number, MailResult>(
    async (id) => (await api.post<MailResult>(`/invoices/${id}/send`)).data,
    { invalidate: [['invoices']] },
  );

  const creditNote = useWrite<number>(
    async (id) => (await api.post(`/invoices/${id}/credit-note`, {})).data,
    { invalidate: [['invoices'], ['dashboard']], success: 'Avoir émis' },
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
            secondaryDate: editing.dueDate?.slice(0, 10) ?? '',
            notes: editing.notes ?? '',
            version: editing.version,
            currency: editing.currency,
            exchangeRate: String(editing.exchangeRate),
            lines: toDraftLines(editing.lines ?? []),
          }
        : undefined,
    [editing],
  );
  const isOverdue = (invoice: Invoice) =>
    !!invoice.dueDate &&
    new Date(invoice.dueDate).getTime() < Date.now() &&
    ['UNPAID', 'PARTIALLY_PAID'].includes(invoice.status);

  // Reste avoirable, calculé comme côté API : proposer « Avoir » sur une
  // facture déjà entièrement avoirée ne mènerait qu'à un refus.
  const creditable = (invoice: Invoice) => {
    const credited = (invoice.creditNotes ?? [])
      .filter((note) => note.status !== 'CANCELLED')
      .reduce((sum, note) => sum + note.totalTTC, 0);
    return invoice.totalTTC - credited;
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Factures"
        description="Émission, règlements et suivi des impayés."
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
              {INVOICE_FLOW.order.map((value) => (
                <option key={value} value={value}>
                  {INVOICE_FLOW.meta[value].label}
                </option>
              ))}
            </select>
            {can(P.invoicesCreate) && (
              <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                Nouvelle facture
              </Button>
            )}
          </>
        }
      />

      <Card>
        {invoices.isLoading ? (
          <Spinner />
        ) : invoices.isError ? (
          <ErrorState
            message={errorMessage(invoices.error)}
            onRetry={() => void invoices.refetch()}
          />
        ) : invoices.items.length === 0 ? (
          <EmptyState
            icon={<Receipt size={26} />}
            title={status ? 'Aucun résultat' : 'Aucune facture'}
            description={
              status
                ? 'Aucune facture dans ce statut.'
                : "Facturez une commande, ou créez une facture directe."
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Référence</Th>
                <Th>Client</Th>
                <Th>Statut</Th>
                <Th align="right">Total TTC</Th>
                <Th align="right">Reste dû</Th>
                <Th align="right">Échéance</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {invoices.items.map((invoice) => (
                <Tr key={invoice.id} onClick={() => setOpenId(invoice.id)}>
                  <Td className="font-medium text-ink">
                    <span className="inline-flex items-center gap-1.5">
                      {invoice.ref}
                      {invoice.type === 'CREDIT_NOTE' && (
                        <Badge tone="serious">Avoir</Badge>
                      )}
                    </span>
                    {invoice.order && (
                      <span className="block text-[11px] text-ink-3">
                        depuis {invoice.order.ref}
                      </span>
                    )}
                  </Td>
                  <Td>{invoice.partner.name}</Td>
                  <Td>
                    <StatusBadge status={invoice.status} flow={INVOICE_FLOW} />
                  </Td>
                  <Td align="right" numeric className="font-medium text-ink">
                    {invoice.type === 'CREDIT_NOTE' ? '−' : ''}
                    {money(invoice.totalTTC, true, invoice.currency)}
                  </Td>
                  <Td align="right" numeric>
                    {money(invoice.totalTTC - invoice.paidAmount, true, invoice.currency)}
                  </Td>
                  <Td align="right" numeric>
                    <span className="inline-flex items-center gap-1.5">
                      {isOverdue(invoice) && (
                        <Badge tone="serious" icon={<TriangleAlert size={11} />}>
                          En retard
                        </Badge>
                      )}
                      {formatDate(invoice.dueDate)}
                    </span>
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
                        loading={pdf.pendingId === invoice.id}
                        onClick={() =>
                          void pdf.download(
                            `/invoices/${invoice.id}/pdf`,
                            `${invoice.ref}.pdf`,
                            invoice.id,
                          )
                        }
                      >
                        PDF
                      </Button>
                      {!INVOICE_FLOW.editable.includes(invoice.status) &&
                        invoice.status !== 'CANCELLED' &&
                        can(P.invoicesUpdate) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Mail size={14} />}
                            loading={
                              sendInvoice.isPending && sendInvoice.variables === invoice.id
                            }
                            onClick={() =>
                              sendInvoice.mutate(invoice.id, {
                                onSuccess: (result) =>
                                  notify(
                                    result.delivered
                                      ? `Facture envoyée à ${result.to}`
                                      : `Message préparé pour ${result.to} — aucun serveur SMTP configuré, rien n'a été envoyé`,
                                    result.delivered ? 'success' : 'error',
                                  ),
                              })
                            }
                          >
                            Envoyer
                          </Button>
                        )}
                      {invoice.type === 'INVOICE' &&
                        !INVOICE_FLOW.editable.includes(invoice.status) &&
                        invoice.status !== 'CANCELLED' &&
                        creditable(invoice) > 0 &&
                        can(P.invoicesCreate) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<RotateCcw size={14} />}
                            loading={
                              creditNote.isPending && creditNote.variables === invoice.id
                            }
                            onClick={() => creditNote.mutate(invoice.id)}
                          >
                            Avoir
                          </Button>
                        )}
                      {INVOICE_FLOW.editable.includes(invoice.status) &&
                        can(P.invoicesUpdate) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Modifier ${invoice.ref}`}
                            onClick={() => setEditingId(invoice.id)}
                            icon={<Pencil size={14} />}
                          />
                        )}
                      {INVOICE_FLOW.editable.includes(invoice.status) &&
                        can(P.invoicesDelete) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Supprimer ${invoice.ref}`}
                            onClick={() => setDeleting(invoice)}
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
          page={invoices.page}
          totalPages={invoices.totalPages}
          total={invoices.total}
          perPage={pagination.perPage}
          onChange={pagination.setPage}
          label="factures"
        />
      </Card>

      <DocumentFormModal
        open={creating || editingId !== null}
        title={editing ? `Modifier la facture ${editing.ref}` : 'Nouvelle facture'}
        partnerLabel="Client"
        secondaryDateLabel="Échéance"
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
                dueDate: payload.secondaryDate,
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
        title={detail.data?.ref ?? 'Facture'}
        description={detail.data?.partner.name}
        width="lg"
        footer={
          detail.data && can(P.invoicesUpdate) ? (
            <StatusActions
              status={detail.data.status}
              flow={INVOICE_FLOW}
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
              <StatusBadge status={detail.data.status} flow={INVOICE_FLOW} />
              <span>Émise le {formatDate(detail.data.date)}</span>
              {detail.data.dueDate && (
                <span className="text-ink-3">
                  · échéance {formatDate(detail.data.dueDate)}
                </span>
              )}
            </div>

            <DocumentLines lines={detail.data.lines ?? []} />

            <div className="flex justify-end">
              <DocumentTotals
                totalHT={detail.data.totalHT}
                totalVat={detail.data.totalVat}
                totalTTC={detail.data.totalTTC}
                vatBreakdown={detail.data.vatBreakdown}
                currency={detail.data.currency}
                paidAmount={detail.data.paidAmount}
                remainingAmount={detail.data.remainingAmount}
              />
            </div>

            {detail.data.creditedInvoice && (
              <p className="rounded-lg bg-serious-soft px-3 py-2 text-[13px] text-ink-2">
                Avoir corrigeant la facture {detail.data.creditedInvoice.ref}.
              </p>
            )}
            {(detail.data.creditNotes?.length ?? 0) > 0 && (
              <p className="rounded-lg bg-sunken px-3 py-2 text-[13px] text-ink-2">
                Corrigée par {detail.data.creditNotes?.map((n) => n.ref).join(', ')}.
              </p>
            )}

            <PaymentsSection invoice={detail.data} onChanged={() => void detail.refetch()} />

            <Attachments entity="INVOICE" entityId={detail.data.id} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette facture ?"
        message={`La facture ${deleting?.ref} et son PDF seront supprimés.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

/** Liste des règlements et saisie d'un nouvel encaissement. */
function PaymentsSection({
  invoice,
  onChanged,
}: {
  invoice: Invoice;
  onChanged: () => void;
}) {
  const { can } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('TRANSFER');
  const [reference, setReference] = useState('');

  const remaining = invoice.remainingAmount ?? invoice.totalTTC - invoice.paidAmount;
  const canPay =
    can(P.paymentsCreate) && remaining > 0 && !['DRAFT', 'CANCELLED'].includes(invoice.status);

  const addPayment = useWrite<Record<string, unknown>>(
    async (body) => (await api.post(`/invoices/${invoice.id}/payments`, body)).data,
    { invalidate: [['invoices'], ['dashboard']], success: 'Règlement enregistré' },
  );

  const removePayment = useWrite<number>(
    async (paymentId) =>
      (await api.delete(`/invoices/${invoice.id}/payments/${paymentId}`)).data,
    { invalidate: [['invoices'], ['dashboard']], success: 'Règlement supprimé' },
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    addPayment.mutate(
      {
        amount: Number(amount),
        method,
        reference: reference || undefined,
      },
      {
        onSuccess: () => {
          setAmount('');
          setReference('');
          onChanged();
        },
      },
    );
  };

  return (
    <section className="rounded-lg border border-line">
      <header className="flex items-center gap-2 border-b border-line px-3 py-2">
        <Banknote size={15} className="text-ink-3" aria-hidden />
        <h3 className="text-[13px] font-semibold text-ink">Règlements</h3>
        <span className="ml-auto text-xs text-ink-3">
          {invoice.payments?.length ?? 0} enregistré(s)
        </span>
      </header>

      {(invoice.payments?.length ?? 0) > 0 && (
        <ul className="divide-y divide-[var(--border)]">
          {invoice.payments?.map((payment) => (
            <li key={payment.id} className="flex items-center gap-3 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-ink">
                  {money(payment.amount, true)}{' '}
                  <span className="text-ink-3">
                    · {PAYMENT_METHOD_LABEL[payment.method]}
                  </span>
                </p>
                <p className="text-[11px] text-ink-3">
                  {formatDate(payment.date)}
                  {payment.reference ? ` · ${payment.reference}` : ''}
                </p>
              </div>
              {can(P.paymentsDelete) && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Supprimer ce règlement"
                  onClick={() =>
                    removePayment.mutate(payment.id, { onSuccess: onChanged })
                  }
                  icon={<Trash2 size={13} />}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {canPay ? (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2 border-t border-line p-3">
          <div className="w-32">
            <Input
              label="Montant"
              type="number"
              min="0.01"
              max={remaining}
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={String(remaining)}
            />
          </div>
          <div className="w-40">
            <Select
              label="Moyen"
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
            >
              {(Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[]).map((value) => (
                <option key={value} value={value}>
                  {PAYMENT_METHOD_LABEL[value]}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-32 flex-1">
            <Input
              label="Référence"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="N° de chèque, virement…"
            />
          </div>
          <Button type="submit" variant="primary" loading={addPayment.isPending}>
            Encaisser
          </Button>
        </form>
      ) : (
        <p className="border-t border-line px-3 py-2 text-xs text-ink-3">
          {invoice.status === 'DRAFT'
            ? 'Validez la facture pour enregistrer un règlement.'
            : remaining <= 0
              ? 'Facture intégralement réglée.'
              : 'Vous n’avez pas la permission d’enregistrer un règlement.'}
        </p>
      )}
    </section>
  );
}
