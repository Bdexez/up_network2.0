import {
  as,
  createTenant,
  createTestApp,
  seedPermissions,
  type TestContext,
  type TestTenant,
} from './helpers';

describe('Numérotation des documents (e2e)', () => {
  let ctx: TestContext;
  let tenant: TestTenant;
  let other: TestTenant;
  let api: ReturnType<typeof as>;
  let partnerId: number;

  beforeAll(async () => {
    ctx = await createTestApp();
    await seedPermissions(ctx.prisma);
    tenant = await createTenant(ctx, 'num');
    other = await createTenant(ctx, 'num-autre');
    api = as(ctx, tenant);
    partnerId = (await api.post('/partners', { name: 'Client' }).expect(201))
      .body.id;
  });

  afterAll(async () => ctx.close());

  const line = { label: 'Ligne', quantity: 1, unitPrice: 10, vatRate: 20 };

  it('incrémente la séquence document par document', async () => {
    const first = (
      await api.post('/quotes', { partnerId, lines: [line] }).expect(201)
    ).body;
    const second = (
      await api.post('/quotes', { partnerId, lines: [line] }).expect(201)
    ).body;

    const seq = (ref: string) => Number(ref.split('-')[1]);
    expect(seq(second.ref)).toBe(seq(first.ref) + 1);
  });

  it('utilise un préfixe par type de document', async () => {
    const year = new Date().getFullYear();
    const quote = (
      await api.post('/quotes', { partnerId, lines: [line] }).expect(201)
    ).body;
    const order = (
      await api.post('/orders', { partnerId, lines: [line] }).expect(201)
    ).body;
    const invoice = (
      await api.post('/invoices', { partnerId, lines: [line] }).expect(201)
    ).body;

    expect(quote.ref.startsWith(`DE${year}-`)).toBe(true);
    expect(order.ref.startsWith(`CO${year}-`)).toBe(true);
    expect(invoice.ref.startsWith(`FA${year}-`)).toBe(true);
  });

  it('tient des séquences indépendantes par société', async () => {
    const otherApi = as(ctx, other);
    const otherPartner = (
      await otherApi.post('/partners', { name: 'Client' }).expect(201)
    ).body.id;

    const otherQuote = (
      await otherApi
        .post('/quotes', { partnerId: otherPartner, lines: [line] })
        .expect(201)
    ).body;

    // La première société a déjà émis plusieurs devis ; celle-ci repart de 1.
    expect(otherQuote.ref.endsWith('-0001')).toBe(true);
  });

  it('ne produit aucun doublon sous créations simultanées', async () => {
    // `fetch` plutôt que supertest : ce dernier ouvre une connexion par requête
    // et sature les sockets bien avant d'éprouver la base.
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tenant.token}`,
    };

    const created = await Promise.all(
      Array.from({ length: 20 }, () =>
        fetch(`${ctx.baseUrl}/quotes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ partnerId, lines: [line] }),
        }).then((response) => response.json() as Promise<{ ref?: string }>),
      ),
    );

    const refs = created.map((quote) => quote.ref).filter(Boolean);
    expect(refs).toHaveLength(20);
    expect(new Set(refs).size).toBe(20);
  });

  it('attribue la première référence de l’année à une société neuve', async () => {
    const fresh = await createTenant(ctx, `neuve${Date.now() % 100000}`);
    const freshApi = as(ctx, fresh);
    const freshPartner = (
      await freshApi.post('/partners', { name: 'Client' }).expect(201)
    ).body.id;

    // Deux créations simultanées alors qu'aucun compteur n'existe encore :
    // c'est le cas qui mettait l'ancien `upsert` en défaut.
    const [a, b] = await Promise.all([
      freshApi
        .post('/quotes', { partnerId: freshPartner, lines: [line] })
        .expect(201),
      freshApi
        .post('/quotes', { partnerId: freshPartner, lines: [line] })
        .expect(201),
    ]);

    expect(new Set([a.body.ref, b.body.ref]).size).toBe(2);
  });
});
