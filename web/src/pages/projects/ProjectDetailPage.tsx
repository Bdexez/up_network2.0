import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, ListTodo, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { api, errorMessage } from '../../lib/api';
import { useList, useWrite } from '../../lib/hooks';
import { count, formatDate, money } from '../../lib/format';
import {
  PROJECT_FLOW,
  TASK_STATUS_LABEL,
  TASK_STATUS_TONE,
} from '../../lib/documents';
import { P } from '../../lib/permissions';
import type { AppUser, ProjectDetail, TaskStatus } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';
import { StatusActions } from '../../components/documents/StatusActions';
import { StatusBadge } from '../../components/documents/StatusBadge';
import { Attachments } from '../../components/documents/Attachments';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can, user } = useAuth();
  const currency = user?.company?.currency ?? 'EUR';
  const [addingTask, setAddingTask] = useState(false);
  const [loggingTime, setLoggingTime] = useState(false);

  const project = useQuery({
    queryKey: ['projects', 'detail', id],
    queryFn: async () => (await api.get<ProjectDetail>(`/projects/${id}`)).data,
    enabled: !!id,
  });

  const changeStatus = useWrite<{ id: number; status: string }>(
    async ({ id: projectId, status }) =>
      (await api.patch(`/projects/${projectId}/status`, { status })).data,
    { invalidate: [['projects']], success: 'Statut mis à jour' },
  );

  const toggleTask = useWrite<{ taskId: number; status: TaskStatus }>(
    async ({ taskId, status }) =>
      (await api.patch(`/projects/${id}/tasks/${taskId}`, { status })).data,
    { invalidate: [['projects']] },
  );

  const removeTask = useWrite<number>(
    async (taskId) => (await api.delete(`/projects/${id}/tasks/${taskId}`)).data,
    { invalidate: [['projects']], success: 'Tâche supprimée' },
  );

  const removeTime = useWrite<number>(
    async (entryId) => (await api.delete(`/projects/${id}/time/${entryId}`)).data,
    { invalidate: [['projects']], success: 'Saisie supprimée' },
  );

  if (project.isLoading) {
    return (
      <Card>
        <Spinner />
      </Card>
    );
  }

  if (project.isError || !project.data) {
    return (
      <Card>
        <ErrorState
          message={errorMessage(project.error, 'Projet introuvable')}
          onRetry={() => void project.refetch()}
        />
      </Card>
    );
  }

  const data = project.data;
  const metrics = data.metrics;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <button
          type="button"
          onClick={() => navigate('/projets')}
          className="mb-2 inline-flex items-center gap-1.5 text-[13px] text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} aria-hidden />
          Retour aux projets
        </button>

        <PageHeader
          title={data.name}
          description={`${data.ref}${data.partner ? ` · ${data.partner.name}` : ' · projet interne'}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={data.status} flow={PROJECT_FLOW} />
              {can(P.projectsUpdate) && (
                <StatusActions
                  status={data.status}
                  flow={PROJECT_FLOW}
                  disabled={changeStatus.isPending}
                  onChange={(next) =>
                    changeStatus.mutate({ id: data.id, status: next })
                  }
                />
              )}
            </div>
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Temps saisi" value={`${metrics.totalHours} h`} hint={`dont ${metrics.billableHours} h facturables`} />
        <Metric
          label="Reste à facturer"
          value={money(metrics.pendingAmount, false, currency)}
          hint={`${metrics.pendingHours} h non facturées`}
        />
        <Metric
          label="Budget"
          value={metrics.budgetHours ? `${metrics.budgetHours} h` : 'Non suivi'}
          hint={
            metrics.budgetUsedPercent === null
              ? 'Aucun budget fixé'
              : `${metrics.budgetUsedPercent} % consommé`
          }
          tone={metrics.overBudget ? 'alert' : undefined}
        />
        <Metric
          label="Tâches"
          value={count(data.tasks.length)}
          hint={`${data.tasks.filter((t) => t.status === 'DONE').length} terminée(s)`}
        />
      </div>

      {metrics.budgetHours > 0 && (
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-baseline justify-between text-[13px]">
            <span className="text-ink-2">Consommation du budget</span>
            <span
              className={clsx(
                'font-medium tabular-nums',
                metrics.overBudget ? 'text-critical' : 'text-ink',
              )}
            >
              {metrics.totalHours} / {metrics.budgetHours} h
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-sunken">
            <div
              className={clsx(
                'h-full rounded-full transition-[width]',
                metrics.overBudget ? 'bg-critical' : 'bg-accent',
              )}
              style={{
                width: `${Math.min(metrics.budgetUsedPercent ?? 0, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Tâches"
            subtitle={`${data.tasks.length} tâche(s)`}
            action={
              can(P.tasksCreate) && (
                <Button size="sm" icon={<Plus size={14} />} onClick={() => setAddingTask(true)}>
                  Ajouter
                </Button>
              )
            }
          />
          {data.tasks.length === 0 ? (
            <EmptyState icon={<ListTodo size={24} />} title="Aucune tâche" />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {data.tasks.map((task) => (
                <li key={task.id} className="group flex items-start gap-3 px-4 py-2.5">
                  <button
                    type="button"
                    disabled={!can(P.tasksUpdate)}
                    aria-label={
                      task.status === 'DONE' ? 'Rouvrir la tâche' : 'Terminer la tâche'
                    }
                    onClick={() =>
                      toggleTask.mutate({
                        taskId: task.id,
                        status: task.status === 'DONE' ? 'TODO' : 'DONE',
                      })
                    }
                    className={clsx(
                      'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors',
                      task.status === 'DONE'
                        ? 'border-transparent bg-good text-white'
                        : 'border-line-strong hover:border-accent',
                      !can(P.tasksUpdate) && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    {task.status === 'DONE' && <Check size={13} aria-hidden />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={clsx(
                        'text-[13px] font-medium',
                        task.status === 'DONE' ? 'text-ink-3 line-through' : 'text-ink',
                      )}
                    >
                      {task.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge tone={TASK_STATUS_TONE[task.status]}>
                        {TASK_STATUS_LABEL[task.status]}
                      </Badge>
                      {task.estimatedHours > 0 && (
                        <span className="text-[11px] text-ink-3">
                          estimé {task.estimatedHours} h
                        </span>
                      )}
                      {task.assignee && (
                        <span className="text-[11px] text-ink-3">
                          · {task.assignee.username}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-[11px] text-ink-3">
                          · {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {can(P.tasksDelete) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      aria-label={`Supprimer ${task.name}`}
                      onClick={() => removeTask.mutate(task.id)}
                      icon={<Trash2 size={13} />}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Temps passé"
            subtitle={`${data.timeEntries.length} dernière(s) saisie(s)`}
            action={
              can(P.timeCreate) && (
                <Button size="sm" icon={<Clock size={14} />} onClick={() => setLoggingTime(true)}>
                  Saisir
                </Button>
              )
            }
          />
          {data.timeEntries.length === 0 ? (
            <EmptyState icon={<Clock size={24} />} title="Aucune saisie" />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {data.timeEntries.map((entry) => (
                <li key={entry.id} className="group flex items-center gap-3 px-4 py-2.5">
                  <span className="w-14 shrink-0 text-[13px] font-medium tabular-nums text-ink">
                    {entry.hours} h
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-ink">
                      {entry.description ?? entry.task?.name ?? 'Sans description'}
                    </p>
                    <p className="text-[11px] text-ink-3">
                      {formatDate(entry.date)} · {entry.user.username}
                      {entry.task ? ` · ${entry.task.name}` : ''}
                    </p>
                  </div>
                  {!entry.billable && <Badge tone="neutral">Non facturable</Badge>}
                  {entry.invoicedHours > 0 && <Badge tone="good">Facturé</Badge>}
                  {can(P.timeDelete) && entry.invoicedHours === 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      aria-label="Supprimer cette saisie"
                      onClick={() => removeTime.mutate(entry.id)}
                      icon={<Trash2 size={13} />}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Attachments entity="PROJECT" entityId={data.id} />

      <TaskForm projectId={data.id} open={addingTask} onClose={() => setAddingTask(false)} />
      <TimeForm
        projectId={data.id}
        tasks={data.tasks}
        open={loggingTime}
        onClose={() => setLoggingTime(false)}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: 'alert';
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[13px] font-medium text-ink-2">{label}</p>
      <p
        className={clsx(
          'mt-2 text-2xl font-semibold tracking-tight',
          tone === 'alert' ? 'text-critical' : 'text-ink',
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-ink-3">{hint}</p>
    </div>
  );
}

function TaskForm({
  projectId,
  open,
  onClose,
}: {
  projectId: number;
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: '', assigneeId: '', dueDate: '', estimatedHours: '' });
  const users = useList<AppUser>(['users', 'all'], '/users');

  const create = useWrite<Record<string, unknown>>(
    async (body) => (await api.post(`/projects/${projectId}/tasks`, body)).data,
    { invalidate: [['projects']], success: 'Tâche créée' },
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(
      {
        name: form.name,
        assigneeId: form.assigneeId ? Number(form.assigneeId) : undefined,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
        estimatedHours: Number(form.estimatedHours) || 0,
      },
      {
        onSuccess: () => {
          setForm({ name: '', assigneeId: '', dueDate: '', estimatedHours: '' });
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle tâche"
      width="sm"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={create.isPending} form="task-form" type="submit">
            Créer
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} className="flex flex-col gap-3.5">
        <Input
          label="Intitulé"
          required
          value={form.name}
          onChange={(event) => setForm((c) => ({ ...c, name: event.target.value }))}
        />
        <Select
          label="Assignée à"
          value={form.assigneeId}
          onChange={(event) => setForm((c) => ({ ...c, assigneeId: event.target.value }))}
        >
          <option value="">Non assignée</option>
          {(Array.isArray(users.data) ? users.data : []).map((member) => (
            <option key={member.id} value={member.id}>
              {member.username}
            </option>
          ))}
        </Select>
        <Input
          label="Échéance"
          type="date"
          value={form.dueDate}
          onChange={(event) => setForm((c) => ({ ...c, dueDate: event.target.value }))}
        />
        <Input
          label="Estimation (heures)"
          type="number"
          min="0"
          step="0.5"
          value={form.estimatedHours}
          onChange={(event) => setForm((c) => ({ ...c, estimatedHours: event.target.value }))}
        />
      </form>
    </Modal>
  );
}

function TimeForm({
  projectId,
  tasks,
  open,
  onClose,
}: {
  projectId: number;
  tasks: { id: number; name: string }[];
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    hours: '',
    date: new Date().toISOString().slice(0, 10),
    taskId: '',
    description: '',
    billable: true,
  });

  const create = useWrite<Record<string, unknown>>(
    async (body) => (await api.post(`/projects/${projectId}/time`, body)).data,
    { invalidate: [['projects']], success: 'Temps enregistré' },
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(
      {
        hours: Number(form.hours),
        date: new Date(form.date).toISOString(),
        taskId: form.taskId ? Number(form.taskId) : undefined,
        description: form.description || undefined,
        billable: form.billable,
      },
      {
        onSuccess: () => {
          setForm((c) => ({ ...c, hours: '', description: '' }));
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Saisir du temps"
      width="sm"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={create.isPending} form="time-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="time-form" onSubmit={submit} className="flex flex-col gap-3.5">
        <Input
          label="Heures"
          type="number"
          min="0.25"
          step="0.25"
          required
          value={form.hours}
          onChange={(event) => setForm((c) => ({ ...c, hours: event.target.value }))}
        />
        <Input
          label="Date"
          type="date"
          required
          value={form.date}
          onChange={(event) => setForm((c) => ({ ...c, date: event.target.value }))}
        />
        <Select
          label="Tâche"
          value={form.taskId}
          onChange={(event) => setForm((c) => ({ ...c, taskId: event.target.value }))}
        >
          <option value="">Sur le projet</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.name}
            </option>
          ))}
        </Select>
        <Input
          label="Description"
          value={form.description}
          onChange={(event) => setForm((c) => ({ ...c, description: event.target.value }))}
        />
        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          <input
            type="checkbox"
            checked={form.billable}
            onChange={(event) => setForm((c) => ({ ...c, billable: event.target.checked }))}
            className="size-4 accent-[var(--accent)]"
          />
          Temps facturable au client
        </label>
      </form>
    </Modal>
  );
}
