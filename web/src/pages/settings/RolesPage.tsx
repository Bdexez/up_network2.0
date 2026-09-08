import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Plus, Shield, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useList, useWrite } from '../../lib/hooks';
import { P } from '../../lib/permissions';
import type { PermissionGroup, Role } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';

const MODULE_LABEL: Record<string, string> = {
  dashboard: 'Tableau de bord',
  system: 'Administration',
  crm: 'CRM',
  stock: 'Catalogue',
  sales: 'Ventes',
};

export function RolesPage() {
  const { can, refresh } = useAuth();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const roles = useList<Role>(['roles'], '/roles');

  const permissions = useQuery({
    queryKey: ['roles', 'permissions'],
    queryFn: async () => (await api.get<PermissionGroup[]>('/roles/permissions')).data,
  });

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/roles/${id}`)).data,
    { invalidate: [['roles']], success: 'Rôle supprimé' },
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Rôles"
        description="Chaque rôle regroupe un ensemble de permissions."
        actions={
          can(P.rolesCreate) && (
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
              Nouveau rôle
            </Button>
          )
        }
      />

      {roles.isLoading ? (
        <Card>
          <Spinner />
        </Card>
      ) : roles.isError ? (
        <Card>
          <ErrorState message={errorMessage(roles.error)} onRetry={() => void roles.refetch()} />
        </Card>
      ) : (roles.data?.length ?? 0) === 0 ? (
        <Card>
          <EmptyState icon={<Shield size={26} />} title="Aucun rôle" />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roles.data?.map((role) => (
            <Card key={role.id} className="flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-sm font-semibold text-ink">{role.name}</h2>
                    {role.isSystemRole && <Badge tone="neutral">Système</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-3">
                    {role.description ?? 'Aucune description'}
                  </p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  {can(P.rolesUpdate) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Modifier ${role.name}`}
                      onClick={() => setEditing(role)}
                      icon={<Pencil size={14} />}
                    />
                  )}
                  {can(P.rolesDelete) && !role.isSystemRole && (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Supprimer ${role.name}`}
                      onClick={() => setDeleting(role)}
                      icon={<Trash2 size={14} />}
                    />
                  )}
                </div>
              </div>

              <dl className="mt-3 flex gap-4 border-t border-line pt-3 text-xs">
                <div>
                  <dt className="text-ink-3">Permissions</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
                    {role.permissions.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-3">Utilisateurs</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
                    {role.userCount}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}

      <RoleForm
        open={creating || editing !== null}
        role={editing}
        groups={permissions.data ?? []}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => void refresh()}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer ce rôle ?"
        message={`« ${deleting?.name} » sera supprimé. L'opération est refusée s'il est encore attribué.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

function RoleForm({
  open,
  role,
  groups,
  onClose,
  onSaved,
}: {
  open: boolean;
  role: Role | null;
  groups: PermissionGroup[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open) return;
    setName(role?.name ?? '');
    setDescription(role?.description ?? '');
    setSelected(new Set(role?.permissionIds ?? []));
  }, [open, role]);

  const save = useWrite<{ id?: number; body: Record<string, unknown> }>(
    async ({ id, body }) => {
      if (id) return (await api.patch(`/roles/${id}`, body)).data;
      return (await api.post('/roles', body)).data;
    },
    { invalidate: [['roles']], success: 'Rôle enregistré' },
  );

  const toggle = (id: number) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleGroup = (group: PermissionGroup) =>
    setSelected((current) => {
      const next = new Set(current);
      const all = group.permissions.every((permission) => next.has(permission.id));
      for (const permission of group.permissions) {
        if (all) next.delete(permission.id);
        else next.add(permission.id);
      }
      return next;
    });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(
      {
        id: role?.id,
        body: {
          name,
          description: description || undefined,
          permissionIds: [...selected],
        },
      },
      {
        onSuccess: () => {
          // Le rôle modifié peut être celui de l'utilisateur courant :
          // on recharge son profil pour rafraîchir le menu et les boutons.
          onSaved();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={role ? 'Modifier le rôle' : 'Nouveau rôle'}
      width="lg"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={save.isPending} form="role-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="role-form" onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Input
            label="Nom"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Textarea
            label="Description"
            rows={1}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">
            Permissions{' '}
            <span className="font-normal text-ink-3">({selected.size} sélectionnée(s))</span>
          </p>

          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto rounded-lg border border-line p-3">
            {groups.map((group) => {
              const allChecked = group.permissions.every((permission) =>
                selected.has(permission.id),
              );
              return (
                <fieldset key={group.moduleName}>
                  <legend className="mb-1.5 flex w-full items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold tracking-widest text-ink-3 uppercase">
                      {MODULE_LABEL[group.moduleName] ?? group.moduleName}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className="text-[11px] font-medium text-accent hover:underline"
                    >
                      {allChecked ? 'Tout retirer' : 'Tout cocher'}
                    </button>
                  </legend>

                  <div className="grid gap-1 sm:grid-cols-2">
                    {group.permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[13px] text-ink-2 transition-colors hover:bg-sunken"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(permission.id)}
                          onChange={() => toggle(permission.id)}
                          className="size-3.5 shrink-0 accent-[var(--accent)]"
                        />
                        <span className="min-w-0 truncate">
                          {permission.description ?? permission.key}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
