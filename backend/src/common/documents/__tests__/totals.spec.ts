import { computeDocumentTotals, computeLineTotals, round2 } from '../totals';

describe('round2', () => {
  it('arrondit à deux décimales', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.345)).toBe(2.35);
    expect(round2(10)).toBe(10);
  });

  it('corrige les erreurs de représentation binaire', () => {
    // 0.1 + 0.2 vaut 0.30000000000000004 en flottant.
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });
});

describe('computeLineTotals', () => {
  it('calcule HT, TVA et TTC sur une ligne simple', () => {
    expect(
      computeLineTotals({ quantity: 2, unitPrice: 100, vatRate: 20 }),
    ).toEqual({
      totalHT: 200,
      totalVat: 40,
      totalTTC: 240,
    });
  });

  it('applique la remise avant la TVA', () => {
    // 4 × 890 = 3560, −15 % = 3026 HT, TVA 20 % = 605,20
    expect(
      computeLineTotals({
        quantity: 4,
        unitPrice: 890,
        discountPercent: 15,
        vatRate: 20,
      }),
    ).toEqual({ totalHT: 3026, totalVat: 605.2, totalTTC: 3631.2 });
  });

  it('traite une ligne exonérée de TVA', () => {
    expect(
      computeLineTotals({ quantity: 3, unitPrice: 50, vatRate: 0 }),
    ).toEqual({
      totalHT: 150,
      totalVat: 0,
      totalTTC: 150,
    });
  });

  it('borne une remise hors de [0, 100]', () => {
    expect(
      computeLineTotals({ quantity: 1, unitPrice: 100, discountPercent: 150 })
        .totalHT,
    ).toBe(0);
    expect(
      computeLineTotals({ quantity: 1, unitPrice: 100, discountPercent: -50 })
        .totalHT,
    ).toBe(100);
  });

  it('accepte une quantité décimale', () => {
    expect(
      computeLineTotals({ quantity: 1.5, unitPrice: 10, vatRate: 20 }),
    ).toEqual({
      totalHT: 15,
      totalVat: 3,
      totalTTC: 18,
    });
  });
});

describe('computeDocumentTotals', () => {
  it('agrège la TVA par taux', () => {
    const totals = computeDocumentTotals([
      { quantity: 1, unitPrice: 100, vatRate: 20 },
      { quantity: 1, unitPrice: 200, vatRate: 20 },
      { quantity: 1, unitPrice: 100, vatRate: 5.5 },
    ]);

    expect(totals.totalHT).toBe(400);
    expect(totals.vatBreakdown).toEqual([
      { rate: 5.5, base: 100, amount: 5.5 },
      { rate: 20, base: 300, amount: 60 },
    ]);
    expect(totals.totalVat).toBe(65.5);
    expect(totals.totalTTC).toBe(465.5);
  });

  it('exclut les taux nuls de la ventilation', () => {
    const totals = computeDocumentTotals([
      { quantity: 1, unitPrice: 100, vatRate: 0 },
      { quantity: 1, unitPrice: 100, vatRate: 20 },
    ]);

    expect(totals.vatBreakdown).toHaveLength(1);
    expect(totals.vatBreakdown[0].rate).toBe(20);
    expect(totals.totalVat).toBe(20);
  });

  it('renvoie des totaux nuls pour un document vide', () => {
    expect(computeDocumentTotals([])).toEqual({
      totalHT: 0,
      totalVat: 0,
      totalTTC: 0,
      vatBreakdown: [],
    });
  });

  it("agrège par taux plutôt que d'arrondir le total global", () => {
    // Chaque ligne donne 0,033 € de TVA : arrondies séparément puis sommées,
    // on obtient 0,03 ; l'agrégation par taux évite de dériver ligne à ligne.
    const totals = computeDocumentTotals(
      Array.from({ length: 3 }, () => ({
        quantity: 1,
        unitPrice: 0.55,
        vatRate: 6,
      })),
    );

    expect(totals.totalHT).toBe(1.65);
    expect(totals.totalVat).toBe(totals.vatBreakdown[0].amount);
    expect(round2(totals.totalHT + totals.totalVat)).toBe(totals.totalTTC);
  });

  it('garde HT + TVA = TTC sur un jeu de lignes hétérogène', () => {
    const totals = computeDocumentTotals([
      { quantity: 3, unitPrice: 19.99, discountPercent: 5, vatRate: 20 },
      { quantity: 7, unitPrice: 4.35, vatRate: 5.5 },
      { quantity: 1, unitPrice: 1250, discountPercent: 12.5, vatRate: 20 },
    ]);

    expect(round2(totals.totalHT + totals.totalVat)).toBe(totals.totalTTC);
  });
});
