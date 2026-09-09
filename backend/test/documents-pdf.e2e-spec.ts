import {
  as,
  createTenant,
  createTestApp,
  seedPermissions,
  type TestContext,
} from './helpers';

describe('PDF des documents (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
    await seedPermissions(ctx.prisma);
  });

  afterAll(async () => ctx.close());

  /** Crée une société avec un document de chaque type. */
  async function tenantWithDocuments(suffix: string, lineLabel: string) {
    const tenant = await createTenant(ctx, suffix);
    const api = as(ctx, tenant);

    const partnerId = (
      await api.post('/partners', { name: `Client ${suffix}` }).expect(201)
    ).body.id;
    const supplierId = (
      await api
        .post('/partners', { name: `Fournisseur ${suffix}`, type: 'SUPPLIER' })
        .expect(201)
    ).body.id;

    const line = { label: lineLabel, quantity: 2, unitPrice: 125, vatRate: 20 };

    const quote = (
      await api.post('/quotes', { partnerId, lines: [line] }).expect(201)
    ).body;
    const order = (
      await api.post('/orders', { partnerId, lines: [line] }).expect(201)
    ).body;
    const invoice = (
      await api.post('/invoices', { partnerId, lines: [line] }).expect(201)
    ).body;
    const purchase = (
      await api.post('/purchases', { supplierId, lines: [line] }).expect(201)
    ).body;

    return { tenant, api, quote, order, invoice, purchase };
  }

  it('génère un PDF valide pour chaque type de document', async () => {
    const { api, quote, order, invoice, purchase } = await tenantWithDocuments(
      'pdf1',
      'Ligne PDF',
    );

    for (const [url, ref] of [
      [`/quotes/${quote.id}/pdf`, quote.ref],
      [`/orders/${order.id}/pdf`, order.ref],
      [`/invoices/${invoice.id}/pdf`, invoice.ref],
      [`/purchases/${purchase.id}/pdf`, purchase.ref],
    ] as [string, string][]) {
      const response = await api.get(url).expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain(`${ref}.pdf`);
      // Un PDF commence toujours par « %PDF- ».
      expect(Buffer.from(response.body).subarray(0, 5).toString()).toBe(
        '%PDF-',
      );
    }
  });

  it('ne mélange pas les PDF de deux sociétés partageant la même référence', async () => {
    const alpha = await tenantWithDocuments('pdfa', 'LIGNE-ALPHA');
    const beta = await tenantWithDocuments('pdfb', 'LIGNE-BETA');

    // Les deux sociétés émettent bien la même référence de facture.
    expect(alpha.invoice.ref).toBe(beta.invoice.ref);

    const pdfAlpha = Buffer.from(
      (await alpha.api.get(`/invoices/${alpha.invoice.id}/pdf`).expect(200))
        .body,
    );
    const pdfBeta = Buffer.from(
      (await beta.api.get(`/invoices/${beta.invoice.id}/pdf`).expect(200)).body,
    );

    // Contenus différents : chaque société sert son propre fichier.
    expect(pdfAlpha.equals(pdfBeta)).toBe(false);
  });

  it('refuse le PDF d’un document appartenant à une autre société', async () => {
    const alpha = await tenantWithDocuments('pdfc', 'X');
    const beta = await createTenant(ctx, 'pdfd');

    await as(ctx, beta).get(`/invoices/${alpha.invoice.id}/pdf`).expect(404);
    await as(ctx, beta).get(`/quotes/${alpha.quote.id}/pdf`).expect(404);
  });
});
