import { useEffect, useState, type DragEvent, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { api, errorMessage } from '../../lib/api';
import { useList, useWrite } from '../../lib/hooks';
import { formatDate, money } from '../../lib/format';
import { STAGE_COLOR, STAGE_LABEL, STAGE_ORDER } from '../../lib/labels';
import { P } from '../../lib/permissions';
import type { Opportunity, OpportunityStage, PipelineColumn, Partner } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { Card, Dot, ErrorState, PageHeader, Spinner } from '../../components/ui/Surface';
import { useQuery } from '@tanstack/react-query';

const EMPTY = {
  name: '',
  partnerId: '',
  stage: 'QUALIFICATION' as OpportunityStage,
  amount: '',
  probability: '',
  expectedCloseDate: '',
  description: '',
};

export function PipelinePage() {
  const { can } = useAuth();
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Opportunity | null>(null);
  const [dragOver, setDragOver] = useState<OpportunityStage | null>(null);

  const pipeline = useQuery({
    queryKey: ['crm', 'pipeline'],
    queryFn: async () =>
      (await api.get<PipelineColumn[]>('/crm/opportunities/pipeline')).data,
  });

  const move = useWrite<{ id: number; stage: OpportunityStage }>(
    async ({ id, stage }) =>
      (await api.patch(`/crm/opportunities/${id}/stage`, { stage })).data,
    { invalidate: [['crm'], ['dashboard']] },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/crm/opportunities/${id}`)).data,
    { invalidate: [['crm'], ['dashboard']], success: 'Opportunité supprimée' },
  );

  const totalOpen = (pipeline.data ?? [])
    .filter((column) => column.stage !== 'WON' && column.stage !== 'LOST')
    .reduce((acc, column) => acc + column.amount, 0);

  const weightedOpen = (pipeline.data ?? [])
    .filter((column) => column.stage !== 'WON' && column.stage !== 'LOST')
    .reduce((acc, column) => acc + column.weightedAmount, 0);

  const onDrop = (event: DragEvent, stage: OpportunityStage) => {
    event.preventDefault();
    setDragOver(null);
    const id = Number(event.dataTransfer.getData('text/plain'));
    if (!id) return;

    const current = pipeline.data
      ?.flatMap((column) => column.opportunities)
      .find((opportunity) => opportunity.id === id);
    if (!current || current.stage === stage) return;

    move.mutate({ id, stage });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Pipeline"
        description={`${money(totalOpen)} en cours · ${money(weightedOpen)} pondéré par la probabilité.`}
        actions={
          can(P.opportunitiesCreate) && (
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
              Nouvelle opportunité
            </Button>
          )
        }
      />

      {pipeline.isLoading ? (
        <Card>
          <Spinner />
        </Card>
      ) : pipeline.isError ? (
        <Card>
          <ErrorState
            message={errorMessage(pipeline.error)}
            onRetry={() => void pipeline.refetch()}
          />
        </Card>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[64rem] grid-cols-5 gap-3">
            {STAGE_ORDER.map((stage) => {
              const column = pipeline.data?.find((item) => item.stage === stage);
              return (
                <section
                  key={stage}
                  onDragOver={(event) => {
                    if (!can(P.opportunitiesUpdate)) return;
                    event.preventDefault();
                    setDragOver(stage);
                  }}
                  onDragLeave={() => setDragOver((current) => (current === stage ? null : current))}
                  onDrop={(event) => onDrop(event, stage)}
                  className={clsx(
                    'flex flex-col rounded-xl border bg-surface transition-colors',
                    dragOver === stage ? 'border-accent bg-accent-soft/40' : 'border-line',
                  )}
                >
                  <header className="border-b border-line px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Dot color={STAGE_COLOR[stage]} />
                      <h2 className="text-[13px] font-semibold text-ink">
                        {STAGE_LABEL[stage]}
                      </h2>
                      <span className="ml-auto rounded bg-sunken px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-ink-2">
                        {column?.count ?? 0}
                      </span>
                    </div>
                    <p className="mt-1 text-xs tabular-nums text-ink-3">
                      {money(column?.amount ?? 0)}
                    </p>
                  </header>

                  <div className="flex min-h-32 flex-col gap-2 p-2">
                    {(column?.opportunities ?? []).map((opportunity) => (
                      <article
                        key={opportunity.id}
                        draggable={can(P.opportunitiesUpdate)}
                        onDragStart={(event) =>
                          event.dataTransfer.setData('text/plain', String(opportunity.id))
                        }
                        className={clsx(
                          'group rounded-lg border border-line bg-raised p-2.5 transition-colors hover:border-line-strong',
                          can(P.opportunitiesUpdate) && 'cursor-grab active:cursor-grabbing',
                        )}
                      >
                        <p className="text-[13px] leading-snug font-medium text-ink">
                          {opportunity.name}
                        </p>
                        {opportunity.partner && (
                          <p className="mt-0.5 truncate text-[11px] text-ink-3">
                            {opportunity.partner.name}
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-[13px] font-semibold tabular-nums text-ink">
                            {money(opportunity.amount)}
                          </span>
                          <span className="text-[11px] tabular-nums text-ink-3">
                            {opportunity.probability}%
                          </span>
                        </div>

                        {opportunity.expectedCloseDate && (
                          <p className="mt-1 text-[11px] text-ink-3">
                            Clôture prévue {formatDate(opportunity.expectedCloseDate)}
                          </p>
                        )}

                        <div className="mt-2 flex justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          {can(P.opportunitiesUpdate) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label={`Modifier ${opportunity.name}`}
                              onClick={() => setEditing(opportunity)}
                              icon={<Pencil size={13} />}
                            />
                          )}
                          {can(P.opportunitiesDelete) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label={`Supprimer ${opportunity.name}`}
                              onClick={() => setDeleting(opportunity)}
                              icon={<Trash2 size={13} />}
                            />
                          )}
                        </div>
                      </article>
                    ))}

                    {(column?.count ?? 0) === 0 && (
                      <p className="px-1 py-6 text-center text-[11px] text-ink-3">
                        Aucune opportunité
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {can(P.opportunitiesUpdate) && (
        <p className="text-xs text-ink-3">
          Astuce : faites glisser une carte d'une colonne à l'autre pour changer son étape.
        </p>
      )}

      <OpportunityForm
        open={creating || editing !== null}
        opportunity={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette opportunité ?"
        message={`« ${deleting?.name} » sera supprimée du pipeline.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

function OpportunityForm({
  open,
  opportunity,
  onClose,
}: {
  open: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
}) {
  const partners = useList<Partner>(['partners'], '/partners');
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(
      opportunity
        ? {
            name: opportunity.name,
            partnerId: opportunity.partnerId ? String(opportunity.partnerId) : '',
            stage: opportunity.stage,
            amount: String(opportunity.amount),
            probability: String(opportunity.probability),
            expectedCloseDate: opportunity.expectedCloseDate?.slice(0, 10) ?? '',
            description: opportunity.description ?? '',
          }
        : EMPTY,
    );
  }, [open, opportunity]);

  const save = useWrite<{ id?: number; body: Record<string, unknown> }>(
    async ({ id, body }) => {
      if (id) return (await api.patch(`/crm/opportunities/${id}`, body)).data;
      return (await api.post('/crm/opportunities', body)).data;
    },
    { invalidate: [['crm'], ['dashboard']], success: 'Opportunité enregistrée' },
  );

  const update =
    (key: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const body: Record<string, unknown> = {
      name: form.name,
      stage: form.stage,
      amount: Number(form.amount) || 0,
    };
    if (form.partnerId) body.partnerId = Number(form.partnerId);
    if (form.probability !== '') body.probability = Number(form.probability);
    if (form.expectedCloseDate) {
      // Le back attend une date ISO complète.
      body.expectedCloseDate = new Date(form.expectedCloseDate).toISOString();
    }
    if (form.description) body.description = form.description;

    save.mutate({ id: opportunity?.id, body }, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={opportunity ? "Modifier l'opportunité" : 'Nouvelle opportunité'}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={save.isPending} form="opportunity-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="opportunity-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Intitulé" required value={form.name} onChange={update('name')} />
        </div>
        <div className="sm:col-span-2">
          <Select label="Client" value={form.partnerId} onChange={update('partnerId')}>
            <option value="">Aucun client rattaché</option>
            {partners.data?.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </Select>
        </div>
        <Select label="Étape" value={form.stage} onChange={update('stage')}>
          {STAGE_ORDER.map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_LABEL[stage]}
            </option>
          ))}
        </Select>
        <Input
          label="Montant (€)"
          type="number"
          min="0"
          step="0.01"
          required
          value={form.amount}
          onChange={update('amount')}
        />
        <Input
          label="Probabilité (%)"
          type="number"
          min="0"
          max="100"
          hint="Vide = valeur par défaut de l'étape"
          value={form.probability}
          onChange={update('probability')}
        />
        <Input
          label="Clôture prévue"
          type="date"
          value={form.expectedCloseDate}
          onChange={update('expectedCloseDate')}
        />
        <div className="sm:col-span-2">
          <Textarea label="Description" rows={3} value={form.description} onChange={update('description')} />
        </div>
      </form>
    </Modal>
  );
}
