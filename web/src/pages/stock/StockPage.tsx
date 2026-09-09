import { useState, type FormEvent } from 'react';
import clsx from 'clsx';
import {
  ArrowLeftRight,
  Boxes,
  SlidersHorizontal,
  TriangleAlert,

} from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useDebounced, useList, usePage, usePagination, useWrite } from '../../lib/hooks';
import { count, formatDateTime, money } from '../../lib/format';
import { MOVEMENT_TYPE_LABEL, MOVEMENT_TYPE_TONE } from '../../lib/documents';
import { P } from '../../lib/permissions';
import type { StockLevel, StockMovement, Warehouse } from '../../lib/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';

type Tab = 'levels' | 'movements';

export function StockPage() {
  const { can } = useAuth();
  const [tab, setTab] = useState<Tab>('levels');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [warehouseId, setWarehouseId] = useState('');
  const [belowAlert, setBelowAlert] = useState(false);
  const [adjusting, setAdjusting] = useState<StockLevel | null>(null);
  const [transferring, setTransferring] = useState<StockLevel | null>(null);

  const warehouses = useList<Warehouse>(['warehouses'], '/stock/warehouses');

  const levelsPage = usePagination();
  const movementsPage = usePagination();

  const levels = usePage<StockLevel>(['stock', 'levels'], '/stock/levels', {
    ...levelsPage.params,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(belowAlert ? { belowAlert: 'true' } : {}),
  });

  const movements = usePage<StockMovement>(['stock', 'movements'], '/stock/movements', {
    ...movementsPage.params,
    ...(warehouseId ? { warehouseId } : {}),
  });

  // Compteurs calculés sur la page affichée ; le total global vient de l'API.
  const totalValue = levels.items.reduce((acc, row) => acc + row.value, 0);
  const alerts = levels.items.filter((row) => row.belowAlert).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Stock"
        description={`${count(levels.total)} référence(s) suivie(s) · ${money(totalValue)} sur cette page.`}
        actions={
          <>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                levelsPage.reset();
              }}
              placeholder="Produit ou référence…"
            />
            <select
              value={warehouseId}
              onChange={(event) => {
                setWarehouseId(event.target.value);
                levelsPage.reset();
                movementsPage.reset();
              }}
              aria-label="Filtrer par entrepôt"
              className="h-9 cursor-pointer rounded-lg border border-line bg-raised px-3 text-sm text-ink hover:border-line-strong focus:border-accent"
            >
              <option value="">Tous les entrepôts</option>
              {warehouses.data?.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </>
        }
      />

      {alerts > 0 && !belowAlert && (
        <button
          type="button"
          onClick={() => {
            setBelowAlert(true);
            levelsPage.reset();
          }}
          className="flex items-center gap-2.5 rounded-xl border border-line bg-serious-soft px-4 py-3 text-left transition-colors hover:border-line-strong"
        >
          <TriangleAlert size={17} className="shrink-0 text-serious" aria-hidden />
          <p className="text-[13px] text-ink">
            <span className="font-semibold">
              {count(alerts)} référence(s) sous le seuil d'alerte
            </span>{' '}
            — cliquez pour n'afficher que celles-ci.
          </p>
        </button>
      )}

      <div className="flex items-center gap-1 border-b border-line">
        <TabButton active={tab === 'levels'} onClick={() => setTab('levels')}>
          Niveaux
        </TabButton>
        <TabButton active={tab === 'movements'} onClick={() => setTab('movements')}>
          Mouvements
        </TabButton>
        {belowAlert && (
          <button
            type="button"
            onClick={() => {
              setBelowAlert(false);
              levelsPage.reset();
            }}
            className="ml-auto pb-2 text-[13px] font-medium text-accent hover:underline"
          >
            Voir toutes les références
          </button>
        )}
      </div>

      {tab === 'levels' ? (
        <Card>
          {levels.isLoading ? (
            <Spinner />
          ) : levels.isError ? (
            <ErrorState
              message={errorMessage(levels.error)}
              onRetry={() => void levels.refetch()}
            />
          ) : levels.items.length === 0 ? (
            <EmptyState
              icon={<Boxes size={26} />}
              title={belowAlert ? 'Aucune alerte' : 'Aucun produit suivi'}
              description={
                belowAlert
                  ? 'Toutes les références sont au-dessus de leur seuil.'
                  : 'Activez le suivi de stock sur vos produits pour les voir ici.'
              }
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Produit</Th>
                  <Th>Répartition</Th>
                  <Th align="right">Quantité</Th>
                  <Th align="right">Seuil</Th>
                  <Th align="right">Valorisation</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {levels.items.map((row) => (
                  <Tr key={row.productId}>
                    <Td>
                      <span className="font-medium text-ink">{row.name}</span>
                      <code className="ml-2 rounded bg-sunken px-1.5 py-0.5 text-[11px] text-ink-3">
                        {row.sku}
                      </code>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {row.byWarehouse.length === 0 ? (
                          <span className="text-ink-3">—</span>
                        ) : (
                          row.byWarehouse.map((entry) => (
                            <Badge key={entry.warehouseId} tone="neutral">
                              {entry.warehouse} : {entry.quantity}
                            </Badge>
                          ))
                        )}
                      </div>
                    </Td>
                    <Td align="right" numeric>
                      <span
                        className={clsx(
                          'font-medium',
                          row.belowAlert ? 'text-serious' : 'text-ink',
                        )}
                      >
                        {row.quantity}
                      </span>
                    </Td>
                    <Td align="right" numeric>
                      {row.stockAlert || '—'}
                    </Td>
                    <Td align="right" numeric>
                      {money(row.value)}
                    </Td>
                    <Td align="right">
                      {can(P.stockUpdate) && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Ajuster le stock de ${row.name}`}
                            onClick={() => setAdjusting(row)}
                            icon={<SlidersHorizontal size={14} />}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Transférer ${row.name}`}
                            onClick={() => setTransferring(row)}
                            icon={<ArrowLeftRight size={14} />}
                          />
                        </div>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          )}

          <Pagination
            page={levels.page}
            totalPages={levels.totalPages}
            total={levels.total}
            perPage={levelsPage.perPage}
            onChange={levelsPage.setPage}
            label="références"
          />
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Journal des mouvements"
            subtitle="Chaque variation de stock laisse une trace, avec son document d'origine"
          />
          {movements.isLoading ? (
            <Spinner />
          ) : movements.items.length === 0 ? (
            <EmptyState title="Aucun mouvement" />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Type</Th>
                  <Th>Produit</Th>
                  <Th>Entrepôt</Th>
                  <Th align="right">Quantité</Th>
                  <Th align="right">Stock après</Th>
                  <Th>Origine</Th>
                </tr>
              </thead>
              <tbody>
                {movements.items.map((movement) => (
                  <Tr key={movement.id}>
                    <Td numeric>{formatDateTime(movement.createdAt)}</Td>
                    <Td>
                      <Badge tone={MOVEMENT_TYPE_TONE[movement.type]}>
                        {MOVEMENT_TYPE_LABEL[movement.type]}
                      </Badge>
                    </Td>
                    <Td>{movement.product.name}</Td>
                    <Td>{movement.warehouse.name}</Td>
                    <Td align="right" numeric>
                      <span
                        className={clsx(
                          'font-medium',
                          movement.quantity > 0 ? 'text-good' : 'text-serious',
                        )}
                      >
                        {movement.quantity > 0 ? '+' : ''}
                        {movement.quantity}
                      </span>
                    </Td>
                    <Td align="right" numeric>
                      {movement.resultingQuantity}
                    </Td>
                    <Td>
                      {movement.documentRef ? (
                        <code className="rounded bg-sunken px-1.5 py-0.5 text-[11px] text-ink-2">
                          {movement.documentRef}
                        </code>
                      ) : (
                        <span className="text-ink-3">{movement.reason ?? '—'}</span>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          )}

          <Pagination
            page={movements.page}
            totalPages={movements.totalPages}
            total={movements.total}
            perPage={movementsPage.perPage}
            onChange={movementsPage.setPage}
            label="mouvements"
          />
        </Card>
      )}

      <AdjustDialog
        level={adjusting}
        warehouses={warehouses.data ?? []}
        onClose={() => setAdjusting(null)}
      />
      <TransferDialog
        level={transferring}
        warehouses={warehouses.data ?? []}
        onClose={() => setTransferring(null)}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        '-mb-px border-b-2 px-3 pb-2 text-[13px] font-medium transition-colors',
        active
          ? 'border-accent text-accent'
          : 'border-transparent text-ink-2 hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function AdjustDialog({
  level,
  warehouses,
  onClose,
}: {
  level: StockLevel | null;
  warehouses: Warehouse[];
  onClose: () => void;
}) {
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const adjust = useWrite<Record<string, unknown>>(
    async (body) => (await api.post('/stock/adjust', body)).data,
    { invalidate: [['stock'], ['dashboard']], success: 'Stock ajusté' },
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!level) return;
    adjust.mutate(
      {
        productId: level.productId,
        warehouseId: Number(warehouseId || warehouses.find((w) => w.isDefault)?.id),
        quantity: Number(quantity),
        reason: reason || undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open={level !== null}
      onClose={onClose}
      title="Ajuster le stock"
      description={level ? `${level.name} — stock actuel ${level.quantity}` : undefined}
      width="sm"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={adjust.isPending} form="adjust-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="adjust-form" onSubmit={submit} className="flex flex-col gap-3.5">
        <Select
          label="Entrepôt"
          required
          value={warehouseId}
          onChange={(event) => setWarehouseId(event.target.value)}
        >
          <option value="">Sélectionner…</option>
          {warehouses
            .filter((warehouse) => warehouse.isActive)
            .map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
        </Select>
        <Input
          label="Variation"
          type="number"
          step="0.01"
          required
          hint="Positive pour une entrée, négative pour une sortie (ex. -3)"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
        <Input
          label="Motif"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Inventaire, casse, erreur de saisie…"
        />
      </form>
    </Modal>
  );
}

function TransferDialog({
  level,
  warehouses,
  onClose,
}: {
  level: StockLevel | null;
  warehouses: Warehouse[];
  onClose: () => void;
}) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [quantity, setQuantity] = useState('');

  const transfer = useWrite<Record<string, unknown>>(
    async (body) => (await api.post('/stock/transfer', body)).data,
    { invalidate: [['stock']], success: 'Transfert enregistré' },
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!level) return;
    transfer.mutate(
      {
        productId: level.productId,
        fromWarehouseId: Number(from),
        toWarehouseId: Number(to),
        quantity: Number(quantity),
      },
      { onSuccess: onClose },
    );
  };

  const active = warehouses.filter((warehouse) => warehouse.isActive);

  return (
    <Modal
      open={level !== null}
      onClose={onClose}
      title="Transférer entre entrepôts"
      description={level?.name}
      width="sm"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={transfer.isPending} form="transfer-form" type="submit">
            Transférer
          </Button>
        </>
      }
    >
      <form id="transfer-form" onSubmit={submit} className="flex flex-col gap-3.5">
        <Select
          label="Depuis"
          required
          value={from}
          onChange={(event) => setFrom(event.target.value)}
        >
          <option value="">Sélectionner…</option>
          {active.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
              {level?.byWarehouse.find((w) => w.warehouseId === warehouse.id)
                ? ` (${level.byWarehouse.find((w) => w.warehouseId === warehouse.id)!.quantity} en stock)`
                : ' (0 en stock)'}
            </option>
          ))}
        </Select>
        <Select label="Vers" required value={to} onChange={(event) => setTo(event.target.value)}>
          <option value="">Sélectionner…</option>
          {active
            .filter((warehouse) => String(warehouse.id) !== from)
            .map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
        </Select>
        <Input
          label="Quantité"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
      </form>
    </Modal>
  );
}

