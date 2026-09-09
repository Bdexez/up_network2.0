import {
  as,
  createTenant,
  createTestApp,
  seedPermissions,
  type TestContext,
} from './helpers';

describe('Avoirs, conditions de règlement et verrou optimiste (e2e)', () => {
  let ctx: TestContext;
  let api: ReturnType<typeof as>;
  let partnerId: number;

  const line = {
    label: 'Prestation',
    quantity: 2,
    unitPrice: 100,
    vatRate: 20,
  };

  beforeAll(async () => {
    ctx = await createTestApp();
    await seedPermissions(ctx.prisma);
    const tenant = await createTenant(ctx, 'avoirs');
    api = as(ctx, tenant);
    partnerId = (await api.post('/partners', { name: 'Client' }).expect(201))
      .body.id;
  });

  afterAll(async () => ctx.close());

  /** Facture émise et partiellement réglée. */
  async function settledInvoice() {
    const invoice = (
      await api.post('/invoices', { partnerId, lines: [line] }).expect(201)
    ).body;
    await api
      .patch(`/invoices/${invoice.id}/status`, { status: 'UNPAID' })
      .expect(200);
    await api
      .post(`/invoices/${invoice.id}/payments`, { amount: 50 })
      .expect(201);
    return invoice;
  }

  it('émet un avoir total rattaché à la facture', async () => {
    const invoice = await settledInvoice();
    const credit = (
      await api.post(`/invoices/${invoice.id}/credit-note`, {}).expect(201)
    ).body;

    expect(credit.type).toBe('CREDIT_NOTE');
    expect(credit.ref).toMatch(/^AV\d{4}-\d{4}$/);
    expect(credit.status).toBe('UNPAID');
    expect(credit.totalTTC).toBe(invoice.totalTTC);
    expect(credit.creditedInvoice.ref).toBe(invoice.ref);
  });

  it('accepte un avoir partiel', async () => {
    const invoice = await settledInvoice();
    const credit = (
      await api
        .post(`/invoices/${invoice.id}/credit-note`, {
          lines: [
            {
              label: 'Remise geste commercial',
              quantity: 1,
              unitPrice: 50,
              vatRate: 20,
            },
          ],
          reason: 'Geste commercial',
        })
        .expect(201)
    ).body;

    expect(credit.totalTTC).toBe(60);
    expect(credit.notes).toBe('Geste commercial');
  });

  it('refuse un avoir supérieur à la facture', async () => {
    const invoice = await settledInvoice();
    const response = await api
      .post(`/invoices/${invoice.id}/credit-note`, {
        lines: [{ label: 'Trop', quantity: 1, unitPrice: 10000, vatRate: 20 }],
      })
      .expect(400);

    expect(response.body.message).toMatch(/dépasse la facture/);
  });

  it('refuse d’avoirer un avoir ou un brouillon', async () => {
    const invoice = await settledInvoice();
    const credit = (
      await api.post(`/invoices/${invoice.id}/credit-note`, {}).expect(201)
    ).body;

    await api.post(`/invoices/${credit.id}/credit-note`, {}).expect(400);

    const draft = (
      await api.post('/invoices', { partnerId, lines: [line] }).expect(201)
    ).body;
    await api.post(`/invoices/${draft.id}/credit-note`, {}).expect(400);
  });

  it('déduit les avoirs du chiffre d’affaires', async () => {
    const before = (await api.get('/dashboard/overview').expect(200)).body
      .revenue;

    const invoice = (
      await api.post('/invoices', { partnerId, lines: [line] }).expect(201)
    ).body;
    await api
      .patch(`/invoices/${invoice.id}/status`, { status: 'UNPAID' })
      .expect(200);

    const afterInvoice = (await api.get('/dashboard/overview').expect(200)).body
      .revenue;
    expect(afterInvoice).toBe(before + invoice.totalHT);

    await api.post(`/invoices/${invoice.id}/credit-note`, {}).expect(201);
    const afterCredit = (await api.get('/dashboard/overview').expect(200)).body
      .revenue;
    expect(afterCredit).toBe(before);
  });

  it('déduit l’échéance des conditions de règlement', async () => {
    const dayInMs = 86_400_000;
    const elapsedDays = (invoice: { date: string; dueDate: string }) =>
      Math.round(
        (new Date(invoice.dueDate).getTime() -
          new Date(invoice.date).getTime()) /
          dayInMs,
      );

    // Par défaut : le délai de la société (30 jours).
    const standard = (
      await api.post('/invoices', { partnerId, lines: [line] }).expect(201)
    ).body;
    expect(elapsedDays(standard)).toBe(30);

    // Un délai négocié à 0 signifie « comptant », pas « pas de délai ».
    await api
      .patch(`/partners/${partnerId}`, { paymentTermsDays: 0 })
      .expect(200);
    const cash = (
      await api.post('/invoices', { partnerId, lines: [line] }).expect(201)
    ).body;
    expect(elapsedDays(cash)).toBe(0);

    await api
      .patch(`/partners/${partnerId}`, { paymentTermsDays: 45 })
      .expect(200);
    const negotiated = (
      await api.post('/invoices', { partnerId, lines: [line] }).expect(201)
    ).body;
    expect(elapsedDays(negotiated)).toBe(45);
  });

  it('refuse une modification fondée sur une version périmée', async () => {
    const quote = (
      await api.post('/quotes', { partnerId, lines: [line] }).expect(201)
    ).body;

    // Deux utilisateurs ont lu la même version.
    const staleVersion = quote.version;

    const firstSave = await api
      .patch(`/quotes/${quote.id}`, { notes: 'Alice', version: staleVersion })
      .expect(200);
    expect(firstSave.body.version).toBe(staleVersion + 1);

    const conflict = await api
      .patch(`/quotes/${quote.id}`, { notes: 'Bob', version: staleVersion })
      .expect(409);
    expect(conflict.body.message).toMatch(/modifié entre-temps/);

    // Le travail du premier n'a pas été écrasé.
    const current = (await api.get(`/quotes/${quote.id}`).expect(200)).body;
    expect(current.notes).toBe('Alice');

    // Après rechargement, l'enregistrement passe.
    await api
      .patch(`/quotes/${quote.id}`, { notes: 'Bob', version: current.version })
      .expect(200);
  });

  it('laisse passer une modification sans version fournie', async () => {
    const quote = (
      await api.post('/quotes', { partnerId, lines: [line] }).expect(201)
    ).body;
    await api
      .patch(`/quotes/${quote.id}`, { notes: 'import automatisé' })
      .expect(200);
  });
});
