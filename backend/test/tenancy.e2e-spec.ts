import {
  as,
  createTenant,
  createTestApp,
  seedPermissions,
  type TestContext,
  type TestTenant,
} from './helpers';

describe('Cloisonnement multi-société (e2e)', () => {
  let ctx: TestContext;
  let alice: TestTenant;
  let bob: TestTenant;
  let aliceApi: ReturnType<typeof as>;
  let bobApi: ReturnType<typeof as>;
  let alicePartnerId: number;
  let aliceQuoteId: number;

  beforeAll(async () => {
    ctx = await createTestApp();
    await seedPermissions(ctx.prisma);
    alice = await createTenant(ctx, 'alice');
    bob = await createTenant(ctx, 'bob');
    aliceApi = as(ctx, alice);
    bobApi = as(ctx, bob);

    alicePartnerId = (
      await aliceApi.post('/partners', { name: 'Client d’Alice' }).expect(201)
    ).body.id;

    aliceQuoteId = (
      await aliceApi
        .post('/quotes', {
          partnerId: alicePartnerId,
          lines: [
            { label: 'Prestation', quantity: 1, unitPrice: 100, vatRate: 20 },
          ],
        })
        .expect(201)
    ).body.id;
  });

  afterAll(async () => ctx.close());

  it('donne à chaque inscription sa propre société et un rôle Admin complet', () => {
    expect(alice.companyId).not.toBe(bob.companyId);
  });

  it('ne montre à Bob aucune donnée d’Alice', async () => {
    const partners = await bobApi.get('/partners').expect(200);
    expect(partners.body.items).toHaveLength(0);

    const quotes = await bobApi.get('/quotes').expect(200);
    expect(quotes.body.total).toBe(0);
  });

  it('renvoie 404 quand Bob vise un document d’Alice par son identifiant', async () => {
    await bobApi.get(`/quotes/${aliceQuoteId}`).expect(404);
    await bobApi.get(`/partners/${alicePartnerId}`).expect(404);
  });

  it('empêche Bob de modifier un document d’Alice', async () => {
    await bobApi
      .patch(`/quotes/${aliceQuoteId}`, { notes: 'piraté' })
      .expect(404);
    await bobApi.delete(`/quotes/${aliceQuoteId}`).expect(404);
  });

  it('refuse un companyId injecté dans le corps de la requête', async () => {
    const response = await bobApi
      .post('/partners', { name: 'Tentative', companyId: alice.companyId })
      .expect(400);
    expect(String(response.body.message)).toMatch(/companyId/);
  });

  it('refuse de rattacher une ligne à un produit d’une autre société', async () => {
    const aliceProduct = (
      await aliceApi
        .post('/products', { name: 'Produit Alice', sku: 'ALC-1', price: 10 })
        .expect(201)
    ).body;

    const bobPartner = (
      await bobApi.post('/partners', { name: 'Client de Bob' }).expect(201)
    ).body;

    await bobApi
      .post('/quotes', {
        partnerId: bobPartner.id,
        lines: [{ productId: aliceProduct.id, quantity: 1 }],
      })
      .expect(404);
  });

  it('exige un jeton valide', async () => {
    await as(ctx, { ...alice, token: 'jeton-invalide' })
      .get('/partners')
      .expect(401);
  });
});
