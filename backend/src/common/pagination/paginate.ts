/** Enveloppe renvoyée par toutes les listes paginées. */
export interface Paginated<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const DEFAULT_PER_PAGE = 25;
const MAX_PER_PAGE = 200;

export interface PageParams {
  page?: number;
  perPage?: number;
}

/** Normalise les paramètres reçus et en déduit le `skip`/`take` Prisma. */
export function resolvePage({ page, perPage }: PageParams = {}) {
  const safePage = Math.max(Math.trunc(page ?? 1), 1);
  const safePerPage = Math.min(
    Math.max(Math.trunc(perPage ?? DEFAULT_PER_PAGE), 1),
    MAX_PER_PAGE,
  );

  return {
    page: safePage,
    perPage: safePerPage,
    skip: (safePage - 1) * safePerPage,
    take: safePerPage,
  };
}

/**
 * Exécute la requête et son comptage en parallèle, et emballe le résultat.
 *
 * @example
 * return paginate(params, (skip, take) =>
 *   this.prisma.$transaction([
 *     this.prisma.quote.findMany({ where, skip, take }),
 *     this.prisma.quote.count({ where }),
 *   ]),
 * );
 */
export async function paginate<T>(
  params: PageParams | undefined,
  query: (skip: number, take: number) => Promise<[T[], number]>,
): Promise<Paginated<T>> {
  const { page, perPage, skip, take } = resolvePage(params);
  const [items, total] = await query(skip, take);

  return {
    items,
    page,
    perPage,
    total,
    totalPages: Math.max(Math.ceil(total / perPage), 1),
  };
}
