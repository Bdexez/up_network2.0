import {
  as,
  createTenant,
  createTestApp,
  seedPermissions,
  type TestContext,
  type TestTenant,
} from './helpers';

describe('Cycle de vente (e2e)', () => {
  let ctx: TestContext;
  let tenant: TestTenant;
  let api: ReturnType<typeof as>;
  let partnerId: number;
  let productId: number;

  beforeAll(async () => {
    ctx = await createTestApp();
    await seedPermissions(ctx.prisma);
    tenant = await createTenant(ctx, 'ventes');
    api = as(ctx, tenant);

    partnerId = (
      await api.post('/partners', { name: 'Client de test' }).expect(201)
    ).body.id;
    productId = (
      await api
        .post('/products', {
          name: 'Widget',
          sku: 'WID-1',
          price: 100,
          costPrice: 40,
          vatRate: 20,
          manageStock: true,
        })
        .expect(201)
    ).body.id;
  });

  afterAll(async () => ctx.close());

  it('numérote les devis par société et par année', async () => {
    const quote = await api
      .post('/quotes', { partnerId, lines: [{ productId, quantity: 1 }] })
      .expect(201);

    expect(quote.body.ref).toMatch(
      new RegExp(`^DE${new Date().getFullYear()}-\\d{4}$`),
    );
  });

  it('calcule HT, TVA et TTC comme le client', async () => {
    const quote = await api
      .post('/quotes', {
        partnerId,
        lines: [
          { productId, quantity: 4, discountPercent: 15 },
          { label: 'Prestation', quantity: 2, unitPrice: 450, vatRate: 20 },
        ],
      })
      .expect(201);

    // 4 × 100 = 400, −15 % = 340 ; 2 × 450 = 900 ; HT 1240, TVA 248
    expect(quote.body.totalHT).toBe(1240);
    expect(quote.body.totalVat).toBe(248);
    expect(quote.body.totalTTC).toBe(1488);
  });

  it('mène un devis jusqu’à la facture réglée, en sortant le stock', async () => {
    // Stock initial
    const warehouseId = (
      await api
        .post('/stock/warehouses', { name: 'Test', code: 'TST' })
        .expect(201)
    ).body.id;
    await api
      .post('/stock/adjust', { productId, warehouseId, quantity: 10 })
      .expect(201);

    const quote = (
      await api
        .post('/quotes', { partnerId, lines: [{ productId, quantity: 3 }] })
        .expect(201)
    ).body;

    await api
      .patch(`/quotes/${quote.id}/status`, { status: 'VALIDATED' })
      .expect(200);
    await api
      .patch(`/quotes/${quote.id}/status`, { status: 'SIGNED' })
      .expect(200);

    const order = (await api.post(`/quotes/${quote.id}/convert`).expect(201))
      .body;
    expect(order.totalTTC).toBe(quote.totalTTC);

    await api
      .patch(`/orders/${order.id}/status`, { status: 'VALIDATED' })
      .expect(200);
    await api.post(`/orders/${order.id}/ship`, { warehouseId }).expect(201);

    const levels = (await api.get('/stock/levels').expect(200)).body;
    expect(levels.items[0].quantity).toBe(7);

    const invoice = (await api.post(`/orders/${order.id}/invoice`).expect(201))
      .body;
    await api
      .patch(`/invoices/${invoice.id}/status`, { status: 'UNPAID' })
      .expect(200);

    // Acompte puis solde
    await api
      .post(`/invoices/${invoice.id}/payments`, { amount: 100 })
      .expect(201);
    let detail = (await api.get(`/invoices/${invoice.id}`).expect(200)).body;
    expect(detail.status).toBe('PARTIALLY_PAID');
    expect(detail.remainingAmount).toBe(detail.totalTTC - 100);

    await api
      .post(`/invoices/${invoice.id}/payments`, {
        amount: detail.remainingAmount,
      })
      .expect(201);
    detail = (await api.get(`/invoices/${invoice.id}`).expect(200)).body;
    expect(detail.status).toBe('PAID');
    expect(detail.remainingAmount).toBe(0);
  });

  it('refuse un règlement supérieur au reste dû', async () => {
    const invoice = (
      await api
        .post('/invoices', { partnerId, lines: [{ productId, quantity: 1 }] })
        .expect(201)
    ).body;
    await api
      .patch(`/invoices/${invoice.id}/status`, { status: 'UNPAID' })
      .expect(200);

    const response = await api
      .post(`/invoices/${invoice.id}/payments`, { amount: 99999 })
      .expect(400);
    expect(response.body.message).toMatch(/dépasse le reste à payer/);
  });

  it('refuse un règlement sur une facture en brouillon', async () => {
    const invoice = (
      await api
        .post('/invoices', { partnerId, lines: [{ productId, quantity: 1 }] })
        .expect(201)
    ).body;

    const response = await api
      .post(`/invoices/${invoice.id}/payments`, { amount: 1 })
      .expect(400);
    expect(response.body.message).toMatch(/Validez la facture/);
  });

  it('interdit de réécrire une facture déjà encaissée', async () => {
    const invoice = (
      await api
        .post('/invoices', { partnerId, lines: [{ productId, quantity: 1 }] })
        .expect(201)
    ).body;
    await api
      .patch(`/invoices/${invoice.id}/status`, { status: 'UNPAID' })
      .expect(200);
    await api
      .post(`/invoices/${invoice.id}/payments`, { amount: 10 })
      .expect(201);

    // Ni annulation, ni retour en brouillon, ni suppression
    await api
      .patch(`/invoices/${invoice.id}/status`, { status: 'CANCELLED' })
      .expect(400);
    await api.delete(`/invoices/${invoice.id}`).expect(400);
  });

  it('refuse une transition de statut non prévue', async () => {
    const quote = (
      await api
        .post('/quotes', { partnerId, lines: [{ productId, quantity: 1 }] })
        .expect(201)
    ).body;

    const response = await api
      .patch(`/quotes/${quote.id}/status`, { status: 'SIGNED' })
      .expect(400);
    expect(response.body.message).toMatch(/Transition impossible/);
  });
});
