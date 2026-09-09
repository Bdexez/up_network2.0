import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useList, usePage, usePagination, useWrite } from '../../lib/hooks';
import { formatDate } from '../../lib/format';
import { P } from '../../lib/permissions';
import type { AppUser, Role } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
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

const EMPTY = {
  email: '',
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  roleId: '',
};

export function UsersPage() {
  const { can, user: currentUser } = useAuth();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState<AppUser | null>(null);

  const pagination = usePagination();
  const users = usePage<AppUser>(['users'], '/users', pagination.params);
  const roles = useList<Role>(['roles'], '/roles');

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/users/${id}`)).data,
    { invalidate: [['users']], success: 'Utilisateur retiré' },
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Utilisateurs"
        description="Les membres de votre société et leur rôle."
        actions={
          can(P.usersCreate) && (
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
              Inviter un utilisateur
            </Button>
          )
        }
      />

      <Card>
        {users.isLoading ? (
          <Spinner />
        ) : users.isError ? (
          <ErrorState message={errorMessage(users.error)} onRetry={() => void users.refetch()} />
        ) : users.items.length === 0 ? (
          <EmptyState icon={<Users size={26} />} title="Aucun utilisateur" />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Utilisateur</Th>
                <Th>E-mail</Th>
                <Th>Rôle</Th>
                <Th>État</Th>
                <Th align="right">Inscrit le</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {users.items.map((user) => (
                <Tr key={user.id}>
                  <Td>
                    <span className="font-medium text-ink">
                      {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.username}
                    </span>
                    <span className="block text-xs text-ink-3">@{user.username}</span>
                  </Td>
                  <Td>{user.email}</Td>
                  <Td>
                    {user.role ? (
                      <Badge tone="accent">{user.role.name}</Badge>
                    ) : (
                      <Badge tone="serious">Sans rôle</Badge>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={user.isActive ? 'good' : 'neutral'}>
                      {user.isActive ? 'Actif' : 'Désactivé'}
                    </Badge>
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(user.createdAt)}
                  </Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1">
                      {can(P.usersUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Modifier ${user.username}`}
                          onClick={() => setEditing(user)}
                          icon={<Pencil size={14} />}
                        />
                      )}
                      {can(P.usersDelete) && user.id !== currentUser?.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Retirer ${user.username}`}
                          onClick={() => setDeleting(user)}
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
          page={users.page}
          totalPages={users.totalPages}
          total={users.total}
          perPage={pagination.perPage}
          onChange={pagination.setPage}
          label="utilisateurs"
        />
      </Card>

      <UserForm
        open={creating || editing !== null}
        user={editing}
        roles={roles.data ?? []}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Retirer cet utilisateur ?"
        confirmLabel="Retirer"
        message={`${deleting?.username} perdra l'accès à cette société. Son compte n'est supprimé que s'il n'appartient à aucune autre société.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

function UserForm({
  open,
  user,
  roles,
  onClose,
}: {
  open: boolean;
  user: AppUser | null;
  roles: Role[];
  onClose: () => void;
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(
      user
        ? {
            email: user.email,
            username: user.username,
            password: '',
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            roleId: user.role ? String(user.role.id) : '',
          }
        : EMPTY,
    );
  }, [open, user]);

  const save = useWrite<{ id?: number; body: Record<string, unknown> }>(
    async ({ id, body }) => {
      if (id) return (await api.patch(`/users/${id}`, body)).data;
      return (await api.post('/users', body)).data;
    },
    { invalidate: [['users']], success: 'Utilisateur enregistré' },
  );

  const update =
    (key: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const body: Record<string, unknown> = {
      email: form.email,
      username: form.username,
    };
    if (form.firstName) body.firstName = form.firstName;
    if (form.lastName) body.lastName = form.lastName;
    if (form.roleId) body.roleId = Number(form.roleId);
    // À la modification, un mot de passe vide signifie « ne pas changer ».
    if (form.password) body.password = form.password;

    save.mutate({ id: user?.id, body }, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? "Modifier l'utilisateur" : 'Inviter un utilisateur'}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={save.isPending} form="user-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2">
        <Input label="Prénom" value={form.firstName} onChange={update('firstName')} />
        <Input label="Nom" value={form.lastName} onChange={update('lastName')} />
        <div className="sm:col-span-2">
          <Input
            label="Nom d'utilisateur"
            required
            minLength={3}
            value={form.username}
            onChange={update('username')}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="E-mail"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Mot de passe"
            type="password"
            autoComplete="new-password"
            required={!user}
            minLength={6}
            hint={user ? 'Laissez vide pour conserver le mot de passe actuel' : '6 caractères minimum'}
            value={form.password}
            onChange={update('password')}
          />
        </div>
        <div className="sm:col-span-2">
          <Select label="Rôle" value={form.roleId} onChange={update('roleId')}>
            <option value="">Sans rôle (aucun accès)</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
        </div>
      </form>
    </Modal>
  );
}
