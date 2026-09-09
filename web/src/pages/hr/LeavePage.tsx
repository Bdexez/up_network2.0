import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Check, Plus, Trash2, X } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useList, usePage, usePagination, useWrite } from '../../lib/hooks';
import { count, formatDate } from '../../lib/format';
import { LEAVE_FLOW, LEAVE_TYPE_LABEL, LEAVE_TYPE_TONE } from '../../lib/documents';
import { P } from '../../lib/permissions';
import type {
  EmployeeOption,
  LeaveRequest,
  LeaveSummary,
  LeaveType,
} from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../../components/ui/Table';
import { StatusBadge } from '../../components/documents/StatusBadge';

const LEAVE_TYPES: LeaveType[] = ['PAID', 'RTT', 'SICK', 'UNPAID', 'OTHER'];

export function LeavePage() {
  const { can } = useAuth();
  const [status, setStatus] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [asking, setAsking] = useState(false);
  const [deleting, setDeleting] = useState<LeaveRequest | null>(null);
  const [deciding, setDeciding] = useState<LeaveRequest | null>(null);

  const pagination = usePagination();
  const requests = usePage<LeaveRequest>(['leave'], '/hr/leave-requests', {
    ...pagination.params,
    ...(status ? { status } : {}),
    ...(employeeId ? { employeeId: Number(employeeId) } : {}),
  });

  const employees = useList<EmployeeOption>(
    ['employee-options'],
    '/hr/employees/options',
  );

  const summary = useQuery({
    queryKey: ['leave', 'summary'],
    queryFn: async () =>
      (await api.get<LeaveSummary>('/hr/leave-requests/summary')).data,
  });

  const decide = useWrite<{ id: number; status: string; decisionNote?: string }>(
    async ({ id, ...body }) =>
      (await api.patch(`/hr/leave-requests/${id}/status`, body)).data,
    { invalidate: [['leave'], ['employees']], success: 'Demande mise à jour' },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/hr/leave-requests/${id}`)).data,
    { invalidate: [['leave']], success: 'Demande supprimée' },
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Congés & absences"
        description="Demandes, décisions et soldes de congés payés."
        actions={
          <>
            <select
              value={employeeId}
              onChange={(event) => {
                setEmployeeId(event.target.value);
                pagination.reset();
              }}
              aria-label="Filtrer par employé"
              className="h-9 cursor-pointer rounded-lg border border-line bg-raised px-3 text-sm text-ink hover:border-line-strong focus:border-accent"
            >
              <option value="">Tous les employés</option>
              {(employees.data ?? []).map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
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
              {LEAVE_FLOW.order.map((value) => (
                <option key={value} value={value}>
                  {LEAVE_FLOW.meta[value].label}
                </option>
              ))}
            </select>
            {can(P.leaveCreate) && (
              <Button variant="primary" icon={<Plus size={15} />} onClick={() => setAsking(true)}>
                Nouvelle demande
              </Button>
            )}
          </>
        }
      />

      {summary.data && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Tile label="En attente" value={count(summary.data.pending)} hint="à traiter" />
          <Tile label="À venir" value={count(summary.data.upcoming)} hint="absences approuvées" />
          <Tile
            label="Effectif"
            value={count(summary.data.activeEmployees)}
            hint="employés en poste"
          />
          <Tile
            label="Solde global"
            value={`${summary.data.totalPaidLeaveBalance} j`}
            hint="congés payés restants"
          />
        </div>
      )}

      <Card>
        {requests.isLoading ? (
          <Spinner />
        ) : requests.isError ? (
          <ErrorState
            message={errorMessage(requests.error)}
            onRetry={() => void requests.refetch()}
          />
        ) : requests.items.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={26} />}
            title={status || employeeId ? 'Aucun résultat' : 'Aucune demande'}
            description={
              status || employeeId
                ? 'Aucune demande ne correspond à ces filtres.'
                : 'Les demandes de congés déposées apparaîtront ici.'
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Employé</Th>
                <Th>Type</Th>
                <Th align="right">Période</Th>
                <Th align="right">Jours</Th>
                <Th>Statut</Th>
                <Th>Décision</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {requests.items.map((request) => (
                <Tr key={request.id}>
                  <Td>
                    <span className="font-medium text-ink">
                      {request.employee.firstName} {request.employee.lastName}
                    </span>
                    {request.reason && (
                      <span className="block truncate text-[11px] text-ink-3">
                        {request.reason}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={LEAVE_TYPE_TONE[request.type]}>
                      {LEAVE_TYPE_LABEL[request.type]}
                    </Badge>
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(request.startDate)} → {formatDate(request.endDate)}
                  </Td>
                  <Td align="right" numeric>
                    {request.days} j
                  </Td>
                  <Td>
                    <StatusBadge status={request.status} flow={LEAVE_FLOW} />
                  </Td>
                  <Td>
                    {request.decidedBy ? (
                      <span className="text-[11px] text-ink-3">
                        {request.decidedBy.username} · {formatDate(request.decidedAt)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1">
                      {can(P.leaveApprove) && request.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Approuver la demande"
                            disabled={decide.isPending}
                            onClick={() =>
                              decide.mutate({ id: request.id, status: 'APPROVED' })
                            }
                            icon={<Check size={14} />}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Refuser la demande"
                            onClick={() => setDeciding(request)}
                            icon={<X size={14} />}
                          />
                        </>
                      )}
                      {can(P.leaveApprove) && request.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={decide.isPending}
                          onClick={() =>
                            decide.mutate({ id: request.id, status: 'CANCELLED' })
                          }
                        >
                          Annuler
                        </Button>
                      )}
                      {can(P.leaveDelete) && request.status !== 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Supprimer la demande"
                          onClick={() => setDeleting(request)}
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
          page={requests.page}
          totalPages={requests.totalPages}
          total={requests.total}
          perPage={pagination.perPage}
          onChange={pagination.setPage}
          label="demandes"
        />
      </Card>

      <LeaveForm
        open={asking}
        employees={employees.data ?? []}
        onClose={() => setAsking(false)}
      />

      <RefusalDialog
        request={deciding}
        pending={decide.isPending}
        onClose={() => setDeciding(null)}
        onConfirm={(decisionNote) =>
          deciding &&
          decide.mutate(
            { id: deciding.id, status: 'REJECTED', decisionNote },
            { onSuccess: () => setDeciding(null) },
          )
        }
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette demande ?"
        message="La demande sera définitivement retirée de l'historique."
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[13px] font-medium text-ink-2">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink-3">{hint}</p>
    </div>
  );
}

const EMPTY_REQUEST = {
  employeeId: '',
  type: 'PAID' as LeaveType,
  startDate: '',
  endDate: '',
  reason: '',
};

function LeaveForm({
  open,
  employees,
  onClose,
}: {
  open: boolean;
  employees: EmployeeOption[];
  onClose: () => void;
}) {
  const [form, setForm] = useState(EMPTY_REQUEST);

  const create = useWrite<Record<string, unknown>>(
    async (body) => (await api.post('/hr/leave-requests', body)).data,
    { invalidate: [['leave']], success: 'Demande déposée' },
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(
      {
        employeeId: form.employeeId ? Number(form.employeeId) : undefined,
        type: form.type,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        reason: form.reason || undefined,
      },
      {
        onSuccess: () => {
          setForm(EMPTY_REQUEST);
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle demande de congés"
      description="Le nombre de jours ouvrés est calculé par l'API : week-ends et jours fériés sont exclus."
      width="sm"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={create.isPending} form="leave-form" type="submit">
            Déposer
          </Button>
        </>
      }
    >
      <form id="leave-form" onSubmit={submit} className="flex flex-col gap-3.5">
        <Select
          label="Employé"
          hint="Vide : la demande est déposée pour votre propre fiche"
          value={form.employeeId}
          onChange={(event) => setForm((c) => ({ ...c, employeeId: event.target.value }))}
        >
          <option value="">Moi-même</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </Select>
        <Select
          label="Type d'absence"
          value={form.type}
          onChange={(event) =>
            setForm((c) => ({ ...c, type: event.target.value as LeaveType }))
          }
        >
          {LEAVE_TYPES.map((type) => (
            <option key={type} value={type}>
              {LEAVE_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
        <Input
          label="Premier jour"
          type="date"
          required
          value={form.startDate}
          onChange={(event) => setForm((c) => ({ ...c, startDate: event.target.value }))}
        />
        <Input
          label="Dernier jour"
          type="date"
          required
          value={form.endDate}
          onChange={(event) => setForm((c) => ({ ...c, endDate: event.target.value }))}
        />
        <Textarea
          label="Motif"
          rows={2}
          value={form.reason}
          onChange={(event) => setForm((c) => ({ ...c, reason: event.target.value }))}
        />
      </form>
    </Modal>
  );
}

function RefusalDialog({
  request,
  pending,
  onClose,
  onConfirm,
}: {
  request: LeaveRequest | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: (decisionNote?: string) => void;
}) {
  const [note, setNote] = useState('');

  return (
    <Modal
      open={request !== null}
      onClose={onClose}
      title="Refuser la demande"
      description={
        request
          ? `${request.employee.firstName} ${request.employee.lastName} — ${request.days} jour(s)`
          : undefined
      }
      width="sm"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button
            variant="danger"
            loading={pending}
            onClick={() => {
              onConfirm(note || undefined);
              setNote('');
            }}
          >
            Refuser
          </Button>
        </>
      }
    >
      <Textarea
        label="Motif du refus"
        hint="Communiqué à l'employé avec la décision"
        rows={3}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
    </Modal>
  );
}
