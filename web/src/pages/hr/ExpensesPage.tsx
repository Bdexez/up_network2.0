import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useList, usePage, usePagination, useWrite } from '../../lib/hooks';
import { money } from '../../lib/format';
import { EXPENSE_CATEGORY_LABEL, EXPENSE_FLOW } from '../../lib/documents';
import { P } from '../../lib/permissions';
import type {
  EmployeeOption,
  ExpenseCategory,
  ExpenseLineInput,
  ExpenseReport,
} from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import {
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../../components/ui/Table';
import { StatusActions } from '../../components/documents/StatusActions';
import { StatusBadge } from '../../components/documents/StatusBadge';

const CATEGORIES: ExpenseCategory[] = [
  'TRAVEL',
  'MEAL',
  'ACCOMMODATION',
  'SUPPLIES',
  'MILEAGE',
  'OTHER',
];

/** Mois courant au format attendu par `<input type="month">`. */
const currentMonth = () => new Date().toISOString().slice(0, 7);

export function ExpensesPage() {
  const { can, user } = useAuth();
  const currency = user?.company?.currency ?? 'EUR';
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ExpenseReport | null>(null);
  const [deleting, setDeleting] = useState<ExpenseReport | null>(null);

  const pagination = usePagination();
  const reports = usePage<ExpenseReport>(['expense-reports'], '/hr/expense-reports', {
    ...pagination.params,
    ...(status ? { status } : {}),
  });

  const employees = useList<EmployeeOption>(
    ['employee-options'],
    '/hr/employees/options',
  );

  const changeStatus = useWrite<{ id: number; status: string }>(
    async ({ id, status: next }) =>
      (await api.patch(`/hr/expense-reports/${id}/status`, { status: next })).data,
    { invalidate: [['expense-reports']], success: 'Note mise à jour' },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/hr/expense-reports/${id}`)).data,
    { invalidate: [['expense-reports']], success: 'Note supprimée' },
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Notes de frais"
        description="Saisie des dépenses engagées, validation et remboursement."
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
              {EXPENSE_FLOW.order.map((value) => (
                <option key={value} value={value}>
                  {EXPENSE_FLOW.meta[value].label}
                </option>
              ))}
            </select>
            {can(P.expensesCreate) && (
              <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                Nouvelle note
              </Button>
            )}
          </>
        }
      />

      <Card>
        {reports.isLoading ? (
          <Spinner />
        ) : reports.isError ? (
          <ErrorState
            message={errorMessage(reports.error)}
            onRetry={() => void reports.refetch()}
          />
        ) : reports.items.length === 0 ? (
          <EmptyState
            icon={<Receipt size={26} />}
            title={status ? 'Aucun résultat' : 'Aucune note de frais'}
            description={
              status
                ? 'Aucune note dans ce statut.'
                : 'Créez une note pour regrouper les dépenses d’un mois.'
            }
            action={
              !status && can(P.expensesCreate) ? (
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Nouvelle note
                </Button>
              ) : undefined
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Note</Th>
                <Th>Employé</Th>
                <Th align="right">Période</Th>
                <Th align="right">Lignes</Th>
                <Th align="right">Total TTC</Th>
                <Th>Statut</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {reports.items.map((report) => (
                <Tr
                  key={report.id}
                  onClick={can(P.expensesUpdate) ? () => setEditing(report) : undefined}
                >
                  <Td>
                    <span className="font-medium text-ink">{report.ref}</span>
                    {report.notes && (
                      <span className="block truncate text-[11px] text-ink-3">
                        {report.notes}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {report.employee.firstName} {report.employee.lastName}
                  </Td>
                  <Td align="right" numeric>
                    {new Date(report.period).toLocaleDateString('fr-FR', {
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </Td>
                  <Td align="right" numeric>
                    {report.lines.length}
                  </Td>
                  <Td align="right" numeric>
                    {money(report.totalTTC, true, currency)}
                  </Td>
                  <Td>
                    <StatusBadge status={report.status} flow={EXPENSE_FLOW} />
                  </Td>
                  <Td align="right">
                    <div
                      className="flex justify-end gap-1"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {can(P.expensesApprove) && (
                        <StatusActions
                          status={report.status}
                          flow={EXPENSE_FLOW}
                          disabled={changeStatus.isPending}
                          onChange={(next) =>
                            changeStatus.mutate({ id: report.id, status: next })
                          }
                        />
                      )}
                      {can(P.expensesDelete) && report.status !== 'REIMBURSED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Supprimer ${report.ref}`}
                          onClick={() => setDeleting(report)}
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
          page={reports.page}
          totalPages={reports.totalPages}
          total={reports.total}
          perPage={pagination.perPage}
          onChange={pagination.setPage}
          label="notes de frais"
        />
      </Card>

      <ExpenseForm
        open={creating || editing !== null}
        report={editing}
        employees={employees.data ?? []}
        currency={currency}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette note ?"
        message={`« ${deleting?.ref} » et ses lignes seront supprimées.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

const emptyLine = (): ExpenseLineInput => ({
  category: 'TRAVEL',
  date: new Date().toISOString().slice(0, 10),
  description: '',
  amountHT: 0,
  vatRate: 20,
});

function ExpenseForm({
  open,
  report,
  employees,
  currency,
  onClose,
}: {
  open: boolean;
  report: ExpenseReport | null;
  employees: EmployeeOption[];
  currency: string;
  onClose: () => void;
}) {
  const [employeeId, setEmployeeId] = useState('');
  const [period, setPeriod] = useState(currentMonth());
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<ExpenseLineInput[]>([emptyLine()]);

  // Au-delà du brouillon, la note est figée : on l'ouvre en lecture seule.
  const readOnly = report !== null && !EXPENSE_FLOW.editable.includes(report.status);

  useEffect(() => {
    if (!open) return;
    setEmployeeId(report ? String(report.employeeId) : '');
    setPeriod(report ? report.period.slice(0, 7) : currentMonth());
    setNotes(report?.notes ?? '');
    setLines(
      report && report.lines.length > 0
        ? report.lines.map((line) => ({
            category: line.category,
            date: line.date.slice(0, 10),
            description: line.description,
            amountHT: line.amountHT,
            vatRate: line.vatRate,
          }))
        : [emptyLine()],
    );
  }, [open, report]);

  const save = useWrite<{ id?: number; body: Record<string, unknown> }>(
    async ({ id, body }) =>
      id
        ? (await api.patch(`/hr/expense-reports/${id}`, body)).data
        : (await api.post('/hr/expense-reports', body)).data,
    { invalidate: [['expense-reports']], success: 'Note enregistrée' },
  );

  const patchLine = (index: number, patch: Partial<ExpenseLineInput>) =>
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );

  // Le total affiché reprend le calcul de l'API : montant HT + TVA, ligne à ligne.
  const totalTTC = lines.reduce(
    (sum, line) => sum + line.amountHT * (1 + (line.vatRate || 0) / 100),
    0,
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const filled = lines.filter((line) => line.description.trim() && line.amountHT > 0);

    save.mutate(
      {
        id: report?.id,
        body: {
          // La période est un mois : l'API la ramène à son premier jour.
          period: new Date(`${period}-01T00:00:00.000Z`).toISOString(),
          notes: notes || undefined,
          lines: filled.map((line) => ({
            ...line,
            date: new Date(line.date).toISOString(),
          })),
          ...(report ? {} : { employeeId: employeeId ? Number(employeeId) : undefined }),
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={report ? `Note de frais ${report.ref}` : 'Nouvelle note de frais'}
      description={
        readOnly
          ? 'Cette note est engagée dans le circuit de validation : elle n’est plus modifiable.'
          : undefined
      }
      width="lg"
      footer={
        <>
          <Button onClick={onClose}>{readOnly ? 'Fermer' : 'Annuler'}</Button>
          {!readOnly && (
            <Button variant="primary" loading={save.isPending} form="expense-form" type="submit">
              Enregistrer
            </Button>
          )}
        </>
      }
    >
      <form id="expense-form" onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-3.5 sm:grid-cols-2">
          {!report && (
            <Select
              label="Employé"
              hint="Vide : la note est créée pour votre propre fiche"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
            >
              <option value="">Moi-même</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </Select>
          )}
          <Input
            label="Mois concerné"
            type="month"
            required
            disabled={readOnly}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Commentaire"
              rows={2}
              disabled={readOnly}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-ink">Dépenses</h3>
            {!readOnly && (
              <Button
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => setLines((current) => [...current, emptyLine()])}
              >
                Ajouter une ligne
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {lines.map((line, index) => (
              <div
                key={index}
                className="grid items-end gap-2 rounded-lg border border-line p-2.5 sm:grid-cols-[1fr_1fr_2fr_1fr_1fr_auto]"
              >
                <Select
                  label="Catégorie"
                  disabled={readOnly}
                  value={line.category}
                  onChange={(event) =>
                    patchLine(index, { category: event.target.value as ExpenseCategory })
                  }
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {EXPENSE_CATEGORY_LABEL[category]}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Date"
                  type="date"
                  disabled={readOnly}
                  value={line.date}
                  onChange={(event) => patchLine(index, { date: event.target.value })}
                />
                <Input
                  label="Libellé"
                  disabled={readOnly}
                  value={line.description}
                  onChange={(event) => patchLine(index, { description: event.target.value })}
                />
                <Input
                  label="Montant HT"
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={readOnly}
                  value={String(line.amountHT)}
                  onChange={(event) =>
                    patchLine(index, { amountHT: Number(event.target.value) || 0 })
                  }
                />
                <Input
                  label="TVA %"
                  type="number"
                  min="0"
                  step="0.1"
                  disabled={readOnly}
                  value={String(line.vatRate)}
                  onChange={(event) =>
                    patchLine(index, { vatRate: Number(event.target.value) || 0 })
                  }
                />
                {!readOnly && (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Retirer la ligne ${index + 1}`}
                    onClick={() =>
                      setLines((current) => current.filter((_, i) => i !== index))
                    }
                    icon={<Trash2 size={14} />}
                  />
                )}
              </div>
            ))}
          </div>

          <p className="text-right text-[13px] text-ink-2">
            Total TTC{' '}
            <span className="font-semibold tabular-nums text-ink">
              {money(totalTTC, true, currency)}
            </span>
          </p>
        </div>
      </form>
    </Modal>
  );
}
