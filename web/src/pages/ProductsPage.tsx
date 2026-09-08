import { useEffect, useState, type FormEvent } from 'react';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useDebounced, useList, useWrite } from '../lib/hooks';
import { formatDate, money } from '../lib/format';
import { P } from '../lib/permissions';
import type { Product } from '../lib/types';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Field';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import {
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '../components/ui/Surface';
import { Td, TableWrap, Th, Tr } from '../components/ui/Table';
import { errorMessage } from '../lib/api';

const EMPTY = { name: '', sku: '', description: '', price: '' };

export function ProductsPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const products = useList<Product>(
    ['products'],
    '/products',
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );

  const save = useWrite<{ id?: number; body: typeof EMPTY }>(
    async ({ id, body }) => {
      const payload = {
        name: body.name,
        sku: body.sku,
        description: body.description || undefined,
        price: Number(body.price),
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
            <SearchInput value={search} onChange={setSearch} placeholder="Nom ou référence…" />
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
        ) : (products.data?.length ?? 0) === 0 ? (
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
                <Th align="right">Prix</Th>
                <Th align="right">Créé le</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {products.data?.map((product) => (
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
                  <Td align="right" numeric className="font-medium text-ink">
                    {money(product.price, true)}
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
            price: String(product.price),
          }
        : EMPTY,
    );
  }, [open, product]);

  const update =
    (key: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
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
        <Input
          label="Prix unitaire (€)"
          type="number"
          min="0"
          step="0.01"
          required
          value={form.price}
          onChange={update('price')}
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
