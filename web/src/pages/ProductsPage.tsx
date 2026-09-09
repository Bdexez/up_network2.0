import { useEffect, useState, type FormEvent } from 'react';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useDebounced, usePage, usePagination, useWrite } from '../lib/hooks';
import { formatDate, money } from '../lib/format';
import { PRODUCT_TYPE_LABEL } from '../lib/documents';
import { P } from '../lib/permissions';
import type { Product, ProductType } from '../lib/types';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Field';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { errorMessage } from '../lib/api';

const EMPTY = {
  name: '',
  sku: '',
  description: '',
  type: 'PRODUCT' as ProductType,
  price: '',
  costPrice: '',
  vatRate: '20',
  manageStock: true,
  stockAlert: '0',
};

export function ProductsPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const pagination = usePagination();
  const products = usePage<Product>(['products'], '/products', {
    ...pagination.params,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const save = useWrite<{ id?: number; body: typeof EMPTY }>(
    async ({ id, body }) => {
      const payload = {
        name: body.name,
        sku: body.sku,
        description: body.description || undefined,
        type: body.type,
        price: Number(body.price),
        costPrice: Number(body.costPrice) || 0,
        vatRate: Number(body.vatRate) || 0,
        manageStock: body.manageStock,
        stockAlert: Number(body.stockAlert) || 0,
      };
      if (id) return (await api.patch(`/products/${id}`, payload)).data;
      return (await api.post('/products', payload)).data;
    },
    { invalidate: [['products'], ['dashboard']], success: 'Produit enregistré' },
  );

  const remove = useWrite<number>(
    async (id) => (await api.delete(`/products/${id}`)).data,
    { invalidate: [['products'], ['dashboard']], success: 'Produit supprimé' },
  );

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Catalogue"
        description="Les produits et services facturables."
        actions={
          <>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                pagination.reset();
              }}
              placeholder="Nom ou référence…"
            />
            {can(P.productsCreate) && (
              <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                Nouveau produit
              </Button>
            )}
          </>
        }
      />

      <Card>
        {products.isLoading ? (
          <Spinner />
        ) : products.isError ? (
          <ErrorState
            message={errorMessage(products.error)}
            onRetry={() => void products.refetch()}
          />
        ) : products.items.length === 0 ? (
          <EmptyState
            icon={<Package size={26} />}
            title={search ? 'Aucun résultat' : 'Catalogue vide'}
            description={
              search
                ? 'Aucun produit ne correspond à cette recherche.'
                : 'Ajoutez vos produits et services pour pouvoir créer des commandes.'
            }
            action={
              !search && can(P.productsCreate) ? (
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Nouveau produit
                </Button>
              ) : undefined
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Produit</Th>
                <Th>Référence</Th>
                <Th>Type</Th>
                <Th align="right">Prix HT</Th>
                <Th align="right">TVA</Th>
                <Th align="right">Stock</Th>
                <Th align="right">Créé le</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {products.items.map((product) => (
                <Tr key={product.id}>
                  <Td>
                    <span className="font-medium text-ink">{product.name}</span>
                    {product.description && (
                      <span className="block truncate text-xs text-ink-3">
                        {product.description}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <code className="rounded bg-sunken px-1.5 py-0.5 text-xs text-ink-2">
                      {product.sku}
                    </code>
                  </Td>
                  <Td>
                    <Badge tone={product.type === 'SERVICE' ? 'neutral' : 'accent'}>
                      {PRODUCT_TYPE_LABEL[product.type]}
                    </Badge>
                  </Td>
                  <Td align="right" numeric className="font-medium text-ink">
                    {money(product.price, true)}
                  </Td>
                  <Td align="right" numeric>
                    {product.vatRate} %
                  </Td>
                  <Td align="right" numeric>
                    {product.manageStock ? stockOf(product) : '—'}
                  </Td>
                  <Td align="right" numeric>
                    {formatDate(product.createdAt)}
                  </Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1">
                      {can(P.productsUpdate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Modifier ${product.name}`}
                          onClick={() => setEditing(product)}
                          icon={<Pencil size={14} />}
                        />
                      )}
                      {can(P.productsDelete) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Supprimer ${product.name}`}
                          onClick={() => setDeleting(product)}
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
          page={products.page}
          totalPages={products.totalPages}
          total={products.total}
          perPage={pagination.perPage}
          onChange={pagination.setPage}
          label="produits"
        />
      </Card>

      <ProductForm
        open={creating || editing !== null}
        product={editing}
        loading={save.isPending}
        onClose={closeForm}
        onSubmit={(body) => save.mutate({ id: editing?.id, body }, { onSuccess: closeForm })}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer ce produit ?"
        message={`« ${deleting?.name} » sera retiré du catalogue. L'opération est refusée s'il figure déjà dans une commande.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  );
}

function ProductForm({
  open,
  product,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  product: Product | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (body: typeof EMPTY) => void;
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(
      product
        ? {
            name: product.name,
            sku: product.sku,
            description: product.description ?? '',
            type: product.type,
            price: String(product.price),
            costPrice: String(product.costPrice),
            vatRate: String(product.vatRate),
            manageStock: product.manageStock,
            stockAlert: String(product.stockAlert),
          }
        : EMPTY,
    );
  }, [open, product]);

  type TextKey = Exclude<keyof typeof EMPTY, 'manageStock' | 'type'>;
  const update = (key: TextKey) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? 'Modifier le produit' : 'Nouveau produit'}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" loading={loading} form="product-form" type="submit">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Nom" required value={form.name} onChange={update('name')} />
        </div>
        <Input
          label="Référence (SKU)"
          required
          hint="Unique dans votre société"
          value={form.sku}
          onChange={update('sku')}
        />
        <Select
          label="Type"
          value={form.type}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              type: event.target.value as ProductType,
              // Un service n'est pas suivi en stock par défaut.
              manageStock: event.target.value !== 'SERVICE',
            }))
          }
        >
          {(Object.keys(PRODUCT_TYPE_LABEL) as ProductType[]).map((type) => (
            <option key={type} value={type}>
              {PRODUCT_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
        <Input
          label="Prix de vente HT (€)"
          type="number"
          min="0"
          step="0.01"
          required
          value={form.price}
          onChange={update('price')}
        />
        <Input
          label="Prix d'achat HT (€)"
          type="number"
          min="0"
          step="0.01"
          hint="Sert à valoriser le stock et calculer la marge"
          value={form.costPrice}
          onChange={update('costPrice')}
        />
        <Input
          label="TVA (%)"
          type="number"
          min="0"
          step="0.1"
          value={form.vatRate}
          onChange={update('vatRate')}
        />
        <Input
          label="Seuil d'alerte"
          type="number"
          min="0"
          step="0.01"
          disabled={!form.manageStock}
          hint="0 = pas d'alerte"
          value={form.stockAlert}
          onChange={update('stockAlert')}
        />
        <label className="flex items-center gap-2 text-[13px] text-ink-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.manageStock}
            onChange={(event) =>
              setForm((current) => ({ ...current, manageStock: event.target.checked }))
            }
            className="size-4 accent-[var(--accent)]"
          />
          Suivre cet article en stock
        </label>
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

/** Stock cumulé tous entrepôts, tel que renvoyé par la liste des produits. */
function stockOf(product: Product) {
  return (product.stocks ?? []).reduce((acc, stock) => acc + stock.quantity, 0);
}
