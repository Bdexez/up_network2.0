import { computeExpenseLine, sumExpenseLines } from '../expense-totals';

describe('computeExpenseLine', () => {
  it('ajoute la TVA au montant saisi', () => {
    expect(computeExpenseLine({ amountHT: 100, vatRate: 20 })).toEqual({
      amountHT: 100,
      amountVat: 20,
      amountTTC: 120,
    });
  });

  it('arrondit au centime', () => {
    expect(computeExpenseLine({ amountHT: 12.35, vatRate: 5.5 })).toEqual({
      amountHT: 12.35,
      amountVat: 0.68,
      amountTTC: 13.03,
    });
  });

  it('traite une ligne sans TVA (péage à l’étranger, don…)', () => {
    expect(computeExpenseLine({ amountHT: 42, vatRate: null })).toEqual({
      amountHT: 42,
      amountVat: 0,
      amountTTC: 42,
    });
  });

  it('ramène un taux négatif à zéro', () => {
    expect(computeExpenseLine({ amountHT: 50, vatRate: -20 }).amountVat).toBe(
      0,
    );
  });
});

describe('sumExpenseLines', () => {
  it('somme les lignes arrondies, pas les montants bruts', () => {
    const lines = [
      computeExpenseLine({ amountHT: 12.35, vatRate: 5.5 }),
      computeExpenseLine({ amountHT: 7.15, vatRate: 10 }),
    ];

    expect(sumExpenseLines(lines)).toEqual({
      totalHT: 19.5,
      totalVat: 1.4,
      totalTTC: 20.9,
    });
  });

  it('renvoie des totaux nuls sur une note vide', () => {
    expect(sumExpenseLines([])).toEqual({
      totalHT: 0,
      totalVat: 0,
      totalTTC: 0,
    });
  });
});
