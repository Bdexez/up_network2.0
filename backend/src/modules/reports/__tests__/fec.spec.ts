import {
  buildFecFile,
  checkBalance,
  fecAmount,
  fecDate,
  FEC_COLUMNS,
  toFecLine,
  type FecEntry,
} from '../fec';

const entry = (over: Partial<FecEntry> = {}): FecEntry => ({
  journalCode: 'VT',
  journalLabel: 'Ventes',
  entryNumber: 'FA2026-0001',
  entryDate: new Date('2026-03-05T00:00:00Z'),
  accountNumber: '411000',
  accountLabel: 'Clients',
  pieceRef: 'FA2026-0001',
  pieceDate: new Date('2026-03-05T00:00:00Z'),
  label: 'Facture Boulangerie Lefèvre',
  debit: 1200,
  credit: 0,
  ...over,
});

describe('fecDate', () => {
  it('formate en AAAAMMJJ', () => {
    expect(fecDate(new Date('2026-03-05T00:00:00Z'))).toBe('20260305');
    expect(fecDate(new Date('2026-12-31T23:00:00Z'))).toBe('20261231');
  });
});

describe('fecAmount', () => {
  it('utilise la virgule décimale et deux décimales', () => {
    expect(fecAmount(1200)).toBe('1200,00');
    expect(fecAmount(12.5)).toBe('12,50');
    expect(fecAmount(0)).toBe('0,00');
  });

  it('n’insère pas de séparateur de milliers', () => {
    expect(fecAmount(1234567.89)).toBe('1234567,89');
  });
});

describe('toFecLine', () => {
  it('produit les 18 colonnes normatives', () => {
    expect(toFecLine(entry()).split('\t')).toHaveLength(FEC_COLUMNS.length);
  });

  it('place le débit et le crédit aux bonnes colonnes', () => {
    const columns = toFecLine(entry()).split('\t');
    expect(columns[FEC_COLUMNS.indexOf('Debit')]).toBe('1200,00');
    expect(columns[FEC_COLUMNS.indexOf('Credit')]).toBe('0,00');
    expect(columns[FEC_COLUMNS.indexOf('CompteNum')]).toBe('411000');
  });

  it('neutralise tabulations et sauts de ligne dans les libellés', () => {
    const columns = toFecLine(
      entry({ label: 'Facture\tavec\ntabulation' }),
    ).split('\t');
    expect(columns).toHaveLength(FEC_COLUMNS.length);
    expect(columns[FEC_COLUMNS.indexOf('EcritureLib')]).toBe(
      'Facture avec tabulation',
    );
  });

  it('renseigne le montant en devise seulement s’il y en a un', () => {
    const sansDevise = toFecLine(entry()).split('\t');
    expect(sansDevise[FEC_COLUMNS.indexOf('Montantdevise')]).toBe('');

    const avecDevise = toFecLine(
      entry({ foreignAmount: 1300, foreignCurrency: 'USD' }),
    ).split('\t');
    expect(avecDevise[FEC_COLUMNS.indexOf('Montantdevise')]).toBe('1300,00');
    expect(avecDevise[FEC_COLUMNS.indexOf('Idevise')]).toBe('USD');
  });
});

describe('buildFecFile', () => {
  it('commence par la ligne d’en-tête', () => {
    const file = buildFecFile([entry()]);
    expect(file.split('\r\n')[0]).toBe(FEC_COLUMNS.join('\t'));
  });

  it('sépare les écritures par CRLF et termine le fichier', () => {
    const file = buildFecFile([entry(), entry()]);
    expect(file.split('\r\n').filter(Boolean)).toHaveLength(3);
    expect(file.endsWith('\r\n')).toBe(true);
  });
});

describe('checkBalance', () => {
  it('détecte un jeu équilibré', () => {
    const result = checkBalance([
      entry({ debit: 1200, credit: 0 }),
      entry({ debit: 0, credit: 1000 }),
      entry({ debit: 0, credit: 200 }),
    ]);
    expect(result).toEqual({ debit: 1200, credit: 1200, balanced: true });
  });

  it('signale un déséquilibre', () => {
    expect(
      checkBalance([
        entry({ debit: 100, credit: 0 }),
        entry({ debit: 0, credit: 90 }),
      ]).balanced,
    ).toBe(false);
  });

  it('tolère les arrondis au centime', () => {
    expect(
      checkBalance([
        entry({ debit: 0.1 + 0.2, credit: 0 }),
        entry({ debit: 0, credit: 0.3 }),
      ]).balanced,
    ).toBe(true);
  });
});
