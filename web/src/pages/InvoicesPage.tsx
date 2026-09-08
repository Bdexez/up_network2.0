import { useState } from 'react';
import { Download, Receipt, Trash2 } from 'lucide-react';
import { api, errorMessage, getToken } from '../lib/api';
import { useList, useWrite } from '../lib/hooks';
import { formatDate, money } from '../lib/format';
import { P } from '../lib/permissions';
import type { Invoice } from '../lib/types';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import {
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../components/ui/Table';

export function InvoicesPage() {
  const { can } = useAuth();
  const { notify } = useToast();
  const [deleting, setDeleting] = useState<Invoice | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  const invoices = useList<Invoice>(['invoices'], '/invoices');

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/invoices/${id}`)).data,
    { invalidate: [['invoices'], ['orders'], ['dashboard']], success: 'Facture supprimée' },
  );

  /**
   * Le PDF est protégé par le jeton : on le récupère en blob plutôt que par
   * un lien direct, qui ne porterait pas l'en-tête Authorization.
   */
  const download = async (invoice: Invoice) => {
    setDownloading(invoice.id);
    try {
      const response = await api.get<Blob>(`/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture_${invoice.orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      notify(errorMessage(error, 'Téléchargement impossible'), 'error');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Factures"
        description="Les factures générées depuis les commandes."
      />

      <Card>
        {invoices.isLoading ? (
          <Spinner />
        ) : invoices.isError ? (
          <ErrorState
            message={errorMessage(invoices.error)}
            onRetry={() => void invoices.refetch()}
          />
        ) : (invoices.data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Receipt size={26} />}
            title="Aucune facture"
            description="Générez une facture depuis l'écran Commandes."
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>N° facture</Th>
                <Th>Commande</Th>
                <Th>Client</Th>
                <Th align="right">Total</Th>
                <Th align="right">Émise le</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {invoices.data?.map((invoice) => (
                <Tr key={invoice.id}>
                  <Td className="font-medium text-ink">
                    F-{String(invoice.id).padStart(4, '0')}
                  </Td>
                  <Td>#{String(invoice.orderId).padStart(4, '0')}</Td>
                  <Td>{invoice.order?.partner?.name ?? '—'}</Td>
                  <Td align="right" numeric className="font-medium text-ink">
                    {money(invoice.total, true)}
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(invoice.createdAt)}
                  </Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Download size={14} />}
                        loading={downloading === invoice.id}
                        onClick={() => void download(invoice)}
                        disabled={!getToken()}
                      >
                        PDF
                      </Button>
                      {can(P.invoicesDelete) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Supprimer la facture ${invoice.id}`}
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
      </Card>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette facture ?"
        message="La facture et son PDF seront supprimés. La commande pourra être facturée à nouveau."
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}
