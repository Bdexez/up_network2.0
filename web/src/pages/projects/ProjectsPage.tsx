import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useList, usePage, usePagination, useWrite } from '../../lib/hooks';
import { count, formatDate, money } from '../../lib/format';
import { PROJECT_FLOW } from '../../lib/documents';
import { P } from '../../lib/permissions';
import type { PartnerOption, Project } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
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
import { StatusBadge } from '../../components/documents/StatusBadge';

const EMPTY = {
  name: '',
  description: '',
  partnerId: '',
  startDate: '',
  endDate: '',
  budgetHours: '0',
  hourlyRate: '0',
};

export function ProjectsPage() {
  const { can, user } = useAuth();
  const currency = user?.company?.currency ?? 'EUR';
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const pagination = usePagination();
  const projects = usePage<Project>(['projects'], '/projects', {
    ...pagination.params,
    ...(status ? { status } : {}),
  });
  const partners = useList<PartnerOption>(
    ['partner-options', 'customer'],
    '/partners/options',
    { type: 'CUSTOMER' },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/projects/${id}`)).data,
    { invalidate: [['projects']], success: 'Projet supprimé' },
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Projets"
        description="Suivi des chantiers, des tâches et du temps passé."
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
              {PROJECT_FLOW.order.map((value) => (
                <option key={value} value={value}>
                  {PROJECT_FLOW.meta[value].label}
                </option>
              ))}
            </select>
            {can(P.projectsCreate) && (
              <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                Nouveau projet
              </Button>
            )}
          </>
        }
      />

      <Card>
        {projects.isLoading ? (
          <Spinner />
        ) : projects.isError ? (
          <ErrorState
            message={errorMessage(projects.error)}
            onRetry={() => void projects.refetch()}
          />
        ) : projects.items.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={26} />}
            title={status ? 'Aucun résultat' : 'Aucun projet'}
            description={
              status
                ? 'Aucun projet dans ce statut.'
                : 'Créez un projet pour suivre ses tâches et le temps passé.'
            }
            action={
              !status && can(P.projectsCreate) ? (
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Nouveau projet
                </Button>
              ) : undefined
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Projet</Th>
                <Th>Client</Th>
                <Th>Statut</Th>
                <Th align="right">Tâches</Th>
                <Th align="right">Budget</Th>
                <Th align="right">Tarif</Th>
                <Th align="right">Début</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {projects.items.map((project) => (
                <Tr key={project.id} onClick={() => navigate(`/projets/${project.id}`)}>
                  <Td>
                    <span className="font-medium text-ink">{project.name}</span>
                    <span className="block text-[11px] text-ink-3">{project.ref}</span>
                  </Td>
                  <Td>{project.partner?.name ?? '—'}</Td>
                  <Td>
                    <StatusBadge status={project.status} flow={PROJECT_FLOW} />
                  </Td>
                  <Td align="right" numeric>
                    {count(project._count?.tasks)}
                  </Td>
                  <Td align="right" numeric>
                    {project.budgetHours ? `${project.budgetHours} h` : '—'}
                  </Td>
                  <Td align="right" numeric>
                    {project.hourlyRate
                      ? `${money(project.hourlyRate, false, currency)}/h`
                      : '—'}
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(project.startDate)}
                  </Td>
                  <Td align="right">
                    <div
                      className="flex justify-end gap-1"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {can(P.projectsUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Modifier ${project.name}`}
                          onClick={() => setEditing(project)}
                          icon={<Pencil size={14} />}
                        />
                      )}
                      {can(P.projectsDelete) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Supprimer ${project.name}`}
                          onClick={() => setDeleting(project)}
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
          page={projects.page}
          totalPages={projects.totalPages}
          total={projects.total}
          perPage={pagination.perPage}
          onChange={pagination.setPage}
          label="projets"
        />
      </Card>

      <ProjectForm
        open={creating || editing !== null}
        project={editing}
        partners={partners.data ?? []}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer ce projet ?"
        message={`« ${deleting?.name} » et ses tâches seront supprimés. L'opération est refusée si du temps y a déjà été saisi.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

function ProjectForm({
  open,
  project,
  partners,
  onClose,
}: {
  open: boolean;
  project: Project | null;
  partners: PartnerOption[];
  onClose: () => void;
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(
      project
        ? {
            name: project.name,
            description: project.description ?? '',
            partnerId: project.partnerId ? String(project.partnerId) : '',
            startDate: project.startDate?.slice(0, 10) ?? '',
            endDate: project.endDate?.slice(0, 10) ?? '',
            budgetHours: String(project.budgetHours),
            hourlyRate: String(project.hourlyRate),
          }
        : EMPTY,
    );
  }, [open, project]);

  const save = useWrite<{ id?: number; body: Record<string, unknown> }>(
    async ({ id, body }) =>
      id
        ? (await api.patch(`/projects/${id}`, body)).data
        : (await api.post('/projects', body)).data,
    { invalidate: [['projects']], success: 'Projet enregistré' },
  );

  const update = (key: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(
      {
        id: project?.id,
        body: {
          name: form.name,
          description: form.description || undefined,
          partnerId: form.partnerId ? Number(form.partnerId) : undefined,
          startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
          endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
          budgetHours: Number(form.budgetHours) || 0,
          hourlyRate: Number(form.hourlyRate) || 0,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? 'Modifier le projet' : 'Nouveau projet'}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={save.isPending} form="project-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Nom" required value={form.name} onChange={update('name')} />
        </div>
        <div className="sm:col-span-2">
          <Select label="Client" value={form.partnerId} onChange={update('partnerId')}>
            <option value="">Projet interne</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </Select>
        </div>
        <Input label="Début" type="date" value={form.startDate} onChange={update('startDate')} />
        <Input label="Fin prévue" type="date" value={form.endDate} onChange={update('endDate')} />
        <Input
          label="Budget (heures)"
          type="number"
          min="0"
          step="0.5"
          hint="0 = non suivi"
          value={form.budgetHours}
          onChange={update('budgetHours')}
        />
        <Input
          label="Tarif horaire (€)"
          type="number"
          min="0"
          step="0.01"
          value={form.hourlyRate}
          onChange={update('hourlyRate')}
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={update('description')}
          />
        </div>
      </form>
    </Modal>
  );
}
