import {
  as,
  createTenant,
  createTestApp,
  seedPermissions,
  type TestContext,
  type TestTenant,
} from './helpers';

describe('Stock (e2e)', () => {
  let ctx: TestContext;
  let tenant: TestTenant;
  let api: ReturnType<typeof as>;
  let productId: number;
  let serviceId: number;
  let mainId: number;
  let secondaryId: number;
  let supplierId: number;

  beforeAll(async () => {
    ctx = await createTestApp();
    await seedPermissions(ctx.prisma);
    tenant = await createTenant(ctx, 'stock');
    api = as(ctx, tenant);

    mainId = (
      await api
        .post('/stock/warehouses', { name: 'Principal', code: 'P' })
        .expect(201)
    ).body.id;
    secondaryId = (
      await api
        .post('/stock/warehouses', { name: 'Secondaire', code: 'S' })
        .expect(201)
    ).body.id;

    productId = (
      await api
        .post('/products', {
          name: 'Article suivi',
          sku: 'SUIVI',
          price: 50,
          costPrice: 20,
          manageStock: true,
          stockAlert: 5,
        })
        .expect(201)
    ).body.id;

    serviceId = (
      await api
        .post('/products', {
          name: 'Prestation',
          sku: 'SRV',
          price: 500,
          type: 'SERVICE',
          manageStock: false,
        })
        .expect(201)
    ).body.id;

    supplierId = (
      await api
        .post('/partners', { name: 'Fournisseur', type: 'SUPPLIER' })
        .expect(201)
    ).body.id;
  });

  afterAll(async () => ctx.close());

  it('refuse une sortie supérieure au disponible', async () => {
    const response = await api
      .post('/stock/adjust', { productId, warehouseId: mainId, quantity: -1 })
      .expect(400);
    expect(response.body.message).toMatch(/Stock insuffisant/);
  });

  it('journalise chaque mouvement avec le stock résultant', async () => {
    await api
      .post('/stock/adjust', { productId, warehouseId: mainId, quantity: 20 })
      .expect(201);

    const movements = (await api.get('/stock/movements').expect(200)).body;
    expect(movements.items[0]).toMatchObject({
      type: 'ADJUSTMENT',
      quantity: 20,
      resultingQuantity: 20,
    });
  });

  it('conserve la quantité totale lors d’un transfert', async () => {
    await api
      .post('/stock/transfer', {
        productId,
        fromWarehouseId: mainId,
        toWarehouseId: secondaryId,
        quantity: 8,
      })
      .expect(201);

    const level = (await api.get('/stock/levels').expect(200)).body.items[0];
    expect(level.quantity).toBe(20);
    expect(level.byWarehouse).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ warehouseId: mainId, quantity: 12 }),
        expect.objectContaining({ warehouseId: secondaryId, quantity: 8 }),
      ]),
    );
  });

  it('refuse un transfert vers le même entrepôt', async () => {
    await api
      .post('/stock/transfer', {
        productId,
        fromWarehouseId: mainId,
        toWarehouseId: mainId,
        quantity: 1,
      })
      .expect(400);
  });

  it('ne mouvemente pas les services', async () => {
    const partnerId = (
      await api.post('/partners', { name: 'Client' }).expect(201)
    ).body.id;
    const order = (
      await api
        .post('/orders', {
          partnerId,
          lines: [{ productId: serviceId, quantity: 3 }],
        })
        .expect(201)
    ).body;

    await api
      .patch(`/orders/${order.id}/status`, { status: 'VALIDATED' })
      .expect(200);
    const before = (await api.get('/stock/movements').expect(200)).body.total;
    await api
      .post(`/orders/${order.id}/ship`, { warehouseId: mainId })
      .expect(201);
    const after = (await api.get('/stock/movements').expect(200)).body.total;

    expect(after).toBe(before);
  });

  it('entre le stock à la réception d’une commande fournisseur', async () => {
    const purchase = (
      await api
        .post('/purchases', {
          supplierId,
          warehouseId: mainId,
          lines: [{ productId, quantity: 15 }],
        })
        .expect(201)
    ).body;

    await api
      .patch(`/purchases/${purchase.id}/status`, { status: 'ORDERED' })
      .expect(200);
    await api.post(`/purchases/${purchase.id}/receive`, {}).expect(201);

    const level = (await api.get('/stock/levels').expect(200)).body.items[0];
    expect(level.quantity).toBe(35);
  });

  it('valorise les achats au prix d’achat, pas au prix de vente', async () => {
    const purchase = (
      await api
        .post('/purchases', { supplierId, lines: [{ productId, quantity: 2 }] })
        .expect(201)
    ).body;

    // 2 × 20 € (coût) et non 2 × 50 € (vente)
    expect(purchase.body?.totalHT ?? purchase.totalHT).toBe(40);
  });

  it('signale les références sous leur seuil d’alerte', async () => {
    // On part de l'état courant plutôt que d'un cumul supposé : le test reste
    // valide même si les scénarios précédents évoluent.
    const level = (await api.get('/stock/levels').expect(200)).body.items[0];
    for (const entry of level.byWarehouse) {
      if (entry.quantity === 0) continue;
      await api
        .post('/stock/adjust', {
          productId,
          warehouseId: entry.warehouseId,
          quantity: -entry.quantity,
        })
        .expect(201);
    }
    // Il reste 4 unités, sous le seuil de 5.
    await api
      .post('/stock/adjust', { productId, warehouseId: mainId, quantity: 4 })
      .expect(201);

    const alerts = (await api.get('/stock/levels?belowAlert=true').expect(200))
      .body;
    expect(alerts.total).toBe(1);
    expect(alerts.items[0]).toMatchObject({ belowAlert: true, quantity: 4 });
  });
});
