import { useEffect, useState, type FormEvent } from 'react';
import { BadgeCheck, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useDebounced, useList, usePage, usePagination, useWrite } from '../../lib/hooks';
import { formatDate } from '../../lib/format';
import { P } from '../../lib/permissions';
import type { AppUser, Employee } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { SearchInput } from '../../components/ui/SearchInput';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../../components/ui/Table';

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  hireDate: '',
  endDate: '',
  userId: '',
  paidLeaveBalance: '25',
  isActive: true,
};

export function EmployeesPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('active');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);

  const debounced = useDebounced(search);
  const pagination = usePagination();
  const employees = usePage<Employee>(['employees'], '/hr/employees', {
    ...pagination.params,
    ...(debounced ? { search: debounced } : {}),
    ...(scope === 'active' ? { isActive: true } : {}),
  });

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/hr/employees/${id}`)).data,
    { invalidate: [['employees']], success: 'Fiche supprimée' },
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Employés"
        description="Fiches du personnel, soldes de congés et rattachement aux comptes."
        actions={
          <>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                pagination.reset();
              }}
              placeholder="Nom, e-mail, poste, service…"
            />
            <select
              value={scope}
              onChange={(event) => {
                setScope(event.target.value);
                pagination.reset();
              }}
              aria-label="Filtrer sur les employés en poste"
              className="h-9 cursor-pointer rounded-lg border border-line bg-raised px-3 text-sm text-ink hover:border-line-strong focus:border-accent"
            >
              <option value="active">En poste</option>
              <option value="all">Tout le personnel</option>
            </select>
            {can(P.employeesCreate) && (
              <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                Nouvel employé
              </Button>
            )}
          </>
        }
      />

      <Card>
        {employees.isLoading ? (
          <Spinner />
        ) : employees.isError ? (
          <ErrorState
            message={errorMessage(employees.error)}
            onRetry={() => void employees.refetch()}
          />
        ) : employees.items.length === 0 ? (
          <EmptyState
            icon={<Users size={26} />}
            title={debounced ? 'Aucun résultat' : 'Aucun employé'}
            description={
              debounced
                ? 'Aucune fiche ne correspond à cette recherche.'
                : 'Créez une fiche pour suivre les congés et les notes de frais.'
            }
            action={
              !debounced && can(P.employeesCreate) ? (
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Nouvel employé
                </Button>
              ) : undefined
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Employé</Th>
                <Th>Poste</Th>
                <Th>Service</Th>
                <Th align="right">Solde CP</Th>
                <Th align="right">Entrée</Th>
                <Th>Compte</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {employees.items.map((employee) => (
                <Tr key={employee.id}>
                  <Td>
                    <span className="font-medium text-ink">
                      {employee.firstName} {employee.lastName}
                    </span>
                    <span className="block text-[11px] text-ink-3">
                      {employee.email ?? '—'}
                    </span>
                  </Td>
                  <Td>{employee.position ?? '—'}</Td>
                  <Td>{employee.department ?? '—'}</Td>
                  <Td align="right" numeric>
                    {employee.paidLeaveBalance} j
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(employee.hireDate)}
                  </Td>
                  <Td>
                    {employee.isActive ? (
                      employee.user ? (
                        <Badge tone="accent" icon={<BadgeCheck size={11} />}>
                          {employee.user.username}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-ink-3">Sans accès</span>
                      )
                    ) : (
                      <Badge tone="neutral">Sortie {formatDate(employee.endDate)}</Badge>
                    )}
                  </Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1">
                      {can(P.employeesUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Modifier ${employee.firstName} ${employee.lastName}`}
                          onClick={() => setEditing(employee)}
                          icon={<Pencil size={14} />}
                        />
                      )}
                      {can(P.employeesDelete) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Supprimer ${employee.firstName} ${employee.lastName}`}
                          onClick={() => setDeleting(employee)}
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
          page={employees.page}
          totalPages={employees.totalPages}
          total={employees.total}
          perPage={pagination.perPage}
          onChange={pagination.setPage}
          label="employés"
        />
      </Card>

      <EmployeeForm
        open={creating || editing !== null}
        employee={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette fiche ?"
        message={`La fiche de ${deleting?.firstName} ${deleting?.lastName} sera supprimée. L'opération est refusée dès qu'un congé ou une note de frais y est rattaché — désactivez-la plutôt.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

function EmployeeForm({
  open,
  employee,
  onClose,
}: {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const users = useList<AppUser>(['users', 'all'], '/users');

  useEffect(() => {
    if (!open) return;
    setForm(
      employee
        ? {
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email ?? '',
            phone: employee.phone ?? '',
            position: employee.position ?? '',
            department: employee.department ?? '',
            hireDate: employee.hireDate?.slice(0, 10) ?? '',
            endDate: employee.endDate?.slice(0, 10) ?? '',
            userId: employee.userId ? String(employee.userId) : '',
            paidLeaveBalance: String(employee.paidLeaveBalance),
            isActive: employee.isActive,
          }
        : EMPTY,
    );
  }, [open, employee]);

  const save = useWrite<{ id?: number; body: Record<string, unknown> }>(
    async ({ id, body }) =>
      id
        ? (await api.patch(`/hr/employees/${id}`, body)).data
        : (await api.post('/hr/employees', body)).data,
    { invalidate: [['employees'], ['employee-options']], success: 'Fiche enregistrée' },
  );

  const update =
    (key: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(
      {
        id: employee?.id,
        body: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || undefined,
          phone: form.phone || undefined,
          position: form.position || undefined,
          department: form.department || undefined,
          hireDate: form.hireDate ? new Date(form.hireDate).toISOString() : undefined,
          endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
          userId: form.userId ? Number(form.userId) : undefined,
          paidLeaveBalance: Number(form.paidLeaveBalance) || 0,
          ...(employee ? { isActive: form.isActive } : {}),
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={employee ? 'Modifier la fiche' : 'Nouvel employé'}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={save.isPending} form="employee-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="employee-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2">
        <Input label="Prénom" required value={form.firstName} onChange={update('firstName')} />
        <Input label="Nom" required value={form.lastName} onChange={update('lastName')} />
        <Input label="E-mail" type="email" value={form.email} onChange={update('email')} />
        <Input label="Téléphone" value={form.phone} onChange={update('phone')} />
        <Input label="Poste" value={form.position} onChange={update('position')} />
        <Input label="Service" value={form.department} onChange={update('department')} />
        <Input label="Date d'entrée" type="date" value={form.hireDate} onChange={update('hireDate')} />
        <Input label="Date de sortie" type="date" value={form.endDate} onChange={update('endDate')} />
        <Input
          label="Solde de congés (jours)"
          type="number"
          min="0"
          step="0.5"
          value={form.paidLeaveBalance}
          onChange={update('paidLeaveBalance')}
        />
        <Select
          label="Compte applicatif"
          hint="Permet à l'employé de poser ses congés lui-même"
          value={form.userId}
          onChange={update('userId')}
        >
          <option value="">Aucun</option>
          {(Array.isArray(users.data) ? users.data : []).map((member) => (
            <option key={member.id} value={member.id}>
              {member.username}
            </option>
          ))}
        </Select>
        {employee && (
          <label className="flex items-center gap-2 text-[13px] text-ink-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
              className="size-4 accent-[var(--accent)]"
            />
            Employé toujours en poste
          </label>
        )}
      </form>
    </Modal>
  );
}
