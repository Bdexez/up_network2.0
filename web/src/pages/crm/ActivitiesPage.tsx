import { useEffect, useState, type FormEvent } from 'react';
import {
  CalendarCheck,
  Check,
  Mail,
  NotebookPen,
  Phone,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import clsx from 'clsx';
import { api, errorMessage } from '../../lib/api';
import { useList, useWrite } from '../../lib/hooks';
import { relativeDate } from '../../lib/format';
import { ACTIVITY_TYPE_LABEL } from '../../lib/labels';
import { P } from '../../lib/permissions';
import type {
  Activity,
  ActivityType,
  Lead,
  Opportunity,
  Partner,
} from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';

const TYPE_ICON: Record<ActivityType, typeof Phone> = {
  CALL: Phone,
  MEETING: Users,
  EMAIL: Mail,
  TASK: CalendarCheck,
  NOTE: NotebookPen,
};

const EMPTY = {
  subject: '',
  type: 'TASK' as ActivityType,
  dueDate: '',
  description: '',
  target: '',
};

export function ActivitiesPage() {
  const { can } = useAuth();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Activity | null>(null);

  const activities = useList<Activity>(['crm', 'activities'], '/crm/activities');

  const toggle = useWrite<number>(
    async (id) => (await api.patch(`/crm/activities/${id}/toggle`)).data,
    { invalidate: [['crm'], ['dashboard']] },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/crm/activities/${id}`)).data,
    { invalidate: [['crm'], ['dashboard']], success: 'Activité supprimée' },
  );

  const planned = activities.data?.filter((item) => item.status === 'PLANNED') ?? [];
  const done = activities.data?.filter((item) => item.status !== 'PLANNED') ?? [];
  const now = Date.now();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Activités"
        description="Appels, réunions et relances à mener."
        actions={
          can(P.activitiesCreate) && (
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
              Nouvelle activité
            </Button>
          )
        }
      />

      {activities.isLoading ? (
        <Card>
          <Spinner />
        </Card>
      ) : activities.isError ? (
        <Card>
          <ErrorState
            message={errorMessage(activities.error)}
            onRetry={() => void activities.refetch()}
          />
        </Card>
      ) : (activities.data?.length ?? 0) === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarCheck size={26} />}
            title="Aucune activité"
            description="Planifiez vos relances et rendez-vous depuis ici."
            action={
              can(P.activitiesCreate) ? (
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Nouvelle activité
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="À faire" subtitle={`${planned.length} activité(s) planifiée(s)`} />
            {planned.length === 0 ? (
              <EmptyState title="Rien à faire" description="Toutes les activités sont traitées." />
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {planned.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    overdue={
                      !!activity.dueDate && new Date(activity.dueDate).getTime() < now
                    }
                    onToggle={() => toggle.mutate(activity.id)}
                    onDelete={() => setDeleting(activity)}
                  />
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Terminées" subtitle={`${done.length} activité(s)`} />
            {done.length === 0 ? (
              <EmptyState title="Aucun historique" description="Les activités closes apparaîtront ici." />
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {done.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    onToggle={() => toggle.mutate(activity.id)}
                    onDelete={() => setDeleting(activity)}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <ActivityForm open={creating} onClose={() => setCreating(false)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette activité ?"
        message={`« ${deleting?.subject} » sera supprimée définitivement.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

function ActivityRow({
  activity,
  overdue,
  onToggle,
  onDelete,
}: {
  activity: Activity;
  overdue?: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { can } = useAuth();
  const Icon = TYPE_ICON[activity.type];
  const isDone = activity.status === 'DONE';
  const link = activity.opportunity ?? activity.lead ?? activity.partner;

  return (
    <li className="group flex items-start gap-3 px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        disabled={!can(P.activitiesUpdate)}
        aria-label={isDone ? 'Marquer à faire' : 'Marquer terminée'}
        className={clsx(
          'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors',
          isDone
            ? 'border-transparent bg-good text-white'
            : 'border-line-strong hover:border-accent',
          !can(P.activitiesUpdate) && 'cursor-not-allowed opacity-60',
        )}
      >
        {isDone && <Check size={13} aria-hidden />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={clsx(
            'text-[13px] font-medium',
            isDone ? 'text-ink-3 line-through' : 'text-ink',
          )}
        >
          {activity.subject}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral" icon={<Icon size={11} aria-hidden />}>
            {ACTIVITY_TYPE_LABEL[activity.type]}
          </Badge>
          {activity.dueDate && (
            <Badge tone={overdue ? 'serious' : 'neutral'}>
              {overdue ? 'En retard · ' : ''}
              {relativeDate(activity.dueDate)}
            </Badge>
          )}
          {link && (
            <span className="truncate text-[11px] text-ink-3">{link.name}</span>
          )}
        </div>

        {activity.description && (
          <p className="mt-1 line-clamp-2 text-xs text-ink-3">{activity.description}</p>
        )}
      </div>

      {can(P.activitiesDelete) && (
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={`Supprimer ${activity.subject}`}
          onClick={onDelete}
          icon={<Trash2 size={14} />}
        />
      )}
    </li>
  );
}

function ActivityForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const leads = useList<Lead>(['crm', 'leads'], '/crm/leads');
  const opportunities = useList<Opportunity>(['crm', 'opportunities'], '/crm/opportunities');
  const partners = useList<Partner>(['partners'], '/partners');

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY);
    setError('');
  }, [open]);

  const create = useWrite<Record<string, unknown>>(
    async (body) => (await api.post('/crm/activities', body)).data,
    { invalidate: [['crm'], ['dashboard']], success: 'Activité créée' },
  );

  const update =
    (key: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.target) {
      return setError('Rattachez l’activité à une piste, une opportunité ou un client.');
    }

    // La cible est encodée « type:id » dans un seul sélecteur.
    const [kind, rawId] = form.target.split(':');
    const body: Record<string, unknown> = {
      subject: form.subject,
      type: form.type,
    };
    if (form.dueDate) body.dueDate = new Date(form.dueDate).toISOString();
    if (form.description) body.description = form.description;
    if (kind === 'lead') body.leadId = Number(rawId);
    if (kind === 'opportunity') body.opportunityId = Number(rawId);
    if (kind === 'partner') body.partnerId = Number(rawId);

    create.mutate(body, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle activité"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={create.isPending} form="activity-form" type="submit">
            Créer
          </Button>
        </>
      }
    >
      <form id="activity-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Objet" required value={form.subject} onChange={update('subject')} />
        </div>
        <Select label="Type" value={form.type} onChange={update('type')}>
          {(Object.keys(ACTIVITY_TYPE_LABEL) as ActivityType[]).map((type) => (
            <option key={type} value={type}>
              {ACTIVITY_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
        <Input
          label="Échéance"
          type="date"
          value={form.dueDate}
          onChange={update('dueDate')}
        />
        <div className="sm:col-span-2">
          <Select label="Rattachée à" required value={form.target} onChange={update('target')}>
            <option value="">Sélectionner…</option>
            {(opportunities.data?.length ?? 0) > 0 && (
              <optgroup label="Opportunités">
                {opportunities.data?.map((opportunity) => (
                  <option key={`o-${opportunity.id}`} value={`opportunity:${opportunity.id}`}>
                    {opportunity.name}
                  </option>
                ))}
              </optgroup>
            )}
            {(leads.data?.length ?? 0) > 0 && (
              <optgroup label="Pistes">
                {leads.data?.map((lead) => (
                  <option key={`l-${lead.id}`} value={`lead:${lead.id}`}>
                    {lead.name}
                  </option>
                ))}
              </optgroup>
            )}
            {(partners.data?.length ?? 0) > 0 && (
              <optgroup label="Clients">
                {partners.data?.map((partner) => (
                  <option key={`p-${partner.id}`} value={`partner:${partner.id}`}>
                    {partner.name}
                  </option>
                ))}
              </optgroup>
            )}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Textarea label="Notes" rows={3} value={form.description} onChange={update('description')} />
        </div>

        {error && (
          <p role="alert" className="text-[13px] text-critical sm:col-span-2">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
