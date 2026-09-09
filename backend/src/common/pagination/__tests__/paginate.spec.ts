import { paginate, resolvePage } from '../paginate';

describe('resolvePage', () => {
  it('applique les valeurs par défaut', () => {
    expect(resolvePage()).toEqual({ page: 1, perPage: 25, skip: 0, take: 25 });
  });

  it('calcule le décalage', () => {
    expect(resolvePage({ page: 3, perPage: 10 })).toMatchObject({
      skip: 20,
      take: 10,
    });
  });

  it('ramène une page inférieure à 1', () => {
    expect(resolvePage({ page: 0 }).page).toBe(1);
    expect(resolvePage({ page: -5 }).page).toBe(1);
  });

  it('plafonne perPage', () => {
    expect(resolvePage({ perPage: 5000 }).perPage).toBe(200);
    expect(resolvePage({ perPage: 0 }).perPage).toBe(1);
  });

  it('tronque les valeurs décimales', () => {
    expect(resolvePage({ page: 2.9, perPage: 10.7 })).toMatchObject({
      page: 2,
      perPage: 10,
    });
  });
});

describe('paginate', () => {
  it('emballe les résultats et calcule le nombre de pages', async () => {
    const result = await paginate({ page: 2, perPage: 10 }, (skip, take) => {
      expect(skip).toBe(10);
      expect(take).toBe(10);
      return Promise.resolve([['a', 'b'], 42] as [string[], number]);
    });

    expect(result).toEqual({
      items: ['a', 'b'],
      page: 2,
      perPage: 10,
      total: 42,
      totalPages: 5,
    });
  });

  it('renvoie une page même quand il n’y a aucun résultat', async () => {
    const result = await paginate(undefined, () =>
      Promise.resolve([[], 0] as [never[], number]),
    );
    expect(result).toMatchObject({ items: [], total: 0, totalPages: 1 });
  });
});
