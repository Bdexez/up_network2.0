import {
  as,
  createTenant,
  createTestApp,
  seedPermissions,
  type TestContext,
} from './helpers';

describe('États comptables (e2e)', () => {
  let ctx: TestContext;
  let api: ReturnType<typeof as>;
  let partnerId: number;
  let supplierId: number;

  const line = {
    label: 'Prestation',
    quantity: 1,
    unitPrice: 1000,
    vatRate: 20,
  };

  beforeAll(async () => {
    ctx = await createTestApp();
    await seedPermissions(ctx.prisma);
    const tenant = await createTenant(ctx, 'etats');
    api = as(ctx, tenant);

    partnerId = (
      await api.post('/partners', { name: 'Client états' }).expect(201)
    ).body.id;
    supplierId = (
      await api
        .post('/partners', { name: 'Fournisseur', type: 'SUPPLIER' })
        .expect(201)
    ).body.id;
  });

  afterAll(async () => ctx.close());

  /** Facture validée, échéance passée de `daysAgo` jours. */
  async function overdueInvoice(daysAgo: number) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - daysAgo);

    const invoice = (
      await api
        .post('/invoices', {
          partnerId,
          lines: [line],
          dueDate: dueDate.toISOString(),
        })
        .expect(201)
    ).body;

    await api
      .patch(`/invoices/${invoice.id}/status`, { status: 'UNPAID' })
      .expect(200);
    return invoice;
  }

  it('ventile l’encours par ancienneté de retard', async () => {
    await overdueInvoice(10);
    await overdueInvoice(45);
    await overdueInvoice(120);

    const report = (await api.get('/reports/aging').expect(200)).body;

    expect(report.totals.days1to30).toBe(1200);
    expect(report.totals.days31to60).toBe(1200);
    expect(report.totals.over90).toBe(1200);
    expect(report.total).toBe(3600);
    expect(report.rows[0].partnerName).toBe('Client états');
  });

  it('liste les factures échues et suit le niveau de relance', async () => {
    const overdue = (await api.get('/reports/overdue').expect(200)).body;
    expect(overdue.length).toBeGreaterThan(0);
    expect(overdue[0].reminderCount).toBe(0);

    const reminded = (
      await api.post(`/reports/overdue/${overdue[0].id}/reminder`).expect(201)
    ).body;
    expect(reminded.reminderCount).toBe(1);
    expect(reminded.lastReminderAt).toBeTruthy();

    const second = (
      await api.post(`/reports/overdue/${overdue[0].id}/reminder`).expect(201)
    ).body;
    expect(second.reminderCount).toBe(2);
  });

  it('récapitule la TVA collectée et déductible', async () => {
    const purchase = (
      await api
        .post('/purchases', {
          supplierId,
          lines: [{ label: 'Achat', quantity: 1, unitPrice: 500, vatRate: 20 }],
        })
        .expect(201)
    ).body;
    await api
      .patch(`/purchases/${purchase.id}/status`, { status: 'ORDERED' })
      .expect(200);

    const vat = (await api.get('/reports/vat').expect(200)).body;

    expect(vat.collected).toContainEqual({ rate: 20, base: 3000, vat: 600 });
    expect(vat.deductible).toContainEqual({ rate: 20, base: 500, vat: 100 });
    expect(vat.balance).toBe(500);
  });

  it('déduit les avoirs de la TVA collectée', async () => {
    const invoice = await overdueInvoice(5);
    const before = (await api.get('/reports/vat').expect(200)).body
      .totalCollected;

    await api.post(`/invoices/${invoice.id}/credit-note`, {}).expect(201);

    const after = (await api.get('/reports/vat').expect(200)).body
      .totalCollected;
    expect(after).toBe(before - 200);
  });

  it('produit un FEC équilibré et conforme au format', async () => {
    const response = await api.get('/reports/fec').expect(200);

    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.headers['x-fec-balanced']).toBe('true');

    // Pas de `trim()` : les dernières colonnes d'une écriture sont souvent
    // vides (lettrage, devise), et rogner la chaîne les ferait disparaître.
    const lines = response.text.split('\r\n').filter((line) => line.length > 0);
    const header = lines[0].split('\t');

    expect(header).toHaveLength(18);
    expect(header[0]).toBe('JournalCode');
    expect(header[11]).toBe('Debit');
    expect(lines.length).toBeGreaterThan(1);

    // Chaque écriture a bien 18 colonnes.
    for (const entry of lines.slice(1)) {
      expect(entry.split('\t')).toHaveLength(18);
    }

    // Partie double : total des débits = total des crédits.
    const sum = (index: number) =>
      lines
        .slice(1)
        .reduce(
          (acc, entry) =>
            acc + Number(entry.split('\t')[index].replace(',', '.')),
          0,
        );
    expect(Math.round(sum(11) * 100)).toBe(Math.round(sum(12) * 100));
  });

  it('restreint les états à la société active', async () => {
    const other = await createTenant(ctx, 'etats2');
    const report = (await as(ctx, other).get('/reports/aging').expect(200))
      .body;
    expect(report.total).toBe(0);
  });
});
