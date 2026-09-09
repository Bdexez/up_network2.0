import { bucketFor, buildAgingReport, daysOverdue } from '../aging';

const REFERENCE = new Date('2026-06-30T12:00:00Z');

describe('daysOverdue', () => {
  it('renvoie 0 sans échéance', () => {
    expect(daysOverdue(null, REFERENCE)).toBe(0);
  });

  it('compte les jours de retard', () => {
    expect(daysOverdue(new Date('2026-06-20T00:00:00Z'), REFERENCE)).toBe(10);
  });

  it('renvoie un nombre négatif avant l’échéance', () => {
    expect(daysOverdue(new Date('2026-07-10T00:00:00Z'), REFERENCE)).toBe(-10);
  });

  it('ignore l’heure de la journée', () => {
    expect(daysOverdue(new Date('2026-06-30T23:59:00Z'), REFERENCE)).toBe(0);
  });
});

describe('bucketFor', () => {
  it('classe chaque durée dans sa tranche', () => {
    expect(bucketFor(-5)).toBe('notDue');
    expect(bucketFor(0)).toBe('notDue');
    expect(bucketFor(1)).toBe('days1to30');
    expect(bucketFor(30)).toBe('days1to30');
    expect(bucketFor(31)).toBe('days31to60');
    expect(bucketFor(90)).toBe('days61to90');
    expect(bucketFor(91)).toBe('over90');
    expect(bucketFor(5000)).toBe('over90');
  });
});

describe('buildAgingReport', () => {
  const invoice = (
    over: Partial<Parameters<typeof buildAgingReport>[0][number]> = {},
  ) => ({
    partnerId: 1,
    partnerName: 'Client A',
    dueDate: new Date('2026-06-20T00:00:00Z'),
    remaining: 100,
    ...over,
  });

  it('regroupe par client et par tranche', () => {
    const report = buildAgingReport(
      [
        invoice(),
        invoice({ dueDate: new Date('2026-05-01T00:00:00Z'), remaining: 250 }),
        invoice({ partnerId: 2, partnerName: 'Client B', remaining: 40 }),
      ],
      REFERENCE,
    );

    expect(report.rows).toHaveLength(2);
    expect(report.rows[0]).toMatchObject({ partnerId: 1, total: 350 });
    expect(report.rows[0].buckets.days1to30).toBe(100);
    expect(report.rows[0].buckets.days31to60).toBe(250);
    expect(report.total).toBe(390);
  });

  it('trie les clients par encours décroissant', () => {
    const report = buildAgingReport(
      [
        invoice({ partnerId: 1, partnerName: 'Petit', remaining: 10 }),
        invoice({ partnerId: 2, partnerName: 'Gros', remaining: 900 }),
      ],
      REFERENCE,
    );
    expect(report.rows.map((row) => row.partnerName)).toEqual([
      'Gros',
      'Petit',
    ]);
  });

  it('totalise chaque tranche', () => {
    const report = buildAgingReport(
      [
        invoice({ dueDate: new Date('2026-07-15T00:00:00Z'), remaining: 60 }),
        invoice({
          partnerId: 2,
          partnerName: 'B',
          dueDate: new Date('2026-01-01T00:00:00Z'),
          remaining: 30,
        }),
      ],
      REFERENCE,
    );
    expect(report.totals.notDue).toBe(60);
    expect(report.totals.over90).toBe(30);
  });

  it('rend un rapport vide sans facture ouverte', () => {
    const report = buildAgingReport([], REFERENCE);
    expect(report.rows).toEqual([]);
    expect(report.total).toBe(0);
  });
});

describe('daysOverdue — robustesse au fuseau', () => {
  /**
   * Un mélange de getters locaux et de `Date.UTC` décalerait ces cas d'un jour
   * dès que le serveur n'est pas en UTC.
   */
  it('reste stable aux bords de journée', () => {
    const reference = new Date('2026-06-30T12:00:00Z');
    expect(daysOverdue(new Date('2026-06-30T00:00:00Z'), reference)).toBe(0);
    expect(daysOverdue(new Date('2026-06-30T23:59:59Z'), reference)).toBe(0);
    expect(daysOverdue(new Date('2026-06-29T23:59:59Z'), reference)).toBe(1);
    expect(daysOverdue(new Date('2026-07-01T00:00:00Z'), reference)).toBe(-1);
  });
});
