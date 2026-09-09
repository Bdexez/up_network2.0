import { computeDueDate, resolvePaymentTermsDays } from '../payment-terms';

describe('resolvePaymentTermsDays', () => {
  it('applique le délai du tiers quand il est défini', () => {
    expect(resolvePaymentTermsDays(45, 30)).toBe(45);
  });

  it('retombe sur celui de la société quand le tiers n’en a pas', () => {
    expect(resolvePaymentTermsDays(null, 30)).toBe(30);
    expect(resolvePaymentTermsDays(undefined, 30)).toBe(30);
  });

  it('respecte un délai de 0 jour (paiement comptant)', () => {
    // Piège classique : `partnerTerms || companyTerms` renverrait 30 ici.
    expect(resolvePaymentTermsDays(0, 30)).toBe(0);
  });
});

describe('computeDueDate', () => {
  it('ajoute le délai à la date d’émission', () => {
    expect(computeDueDate(new Date('2026-01-15T00:00:00Z'), 30)).toEqual(
      new Date('2026-02-14T00:00:00Z'),
    );
  });

  it('rend la date d’émission pour un paiement comptant', () => {
    const issued = new Date('2026-01-15T00:00:00Z');
    expect(computeDueDate(issued, 0)).toEqual(issued);
  });

  it('ignore un délai négatif', () => {
    const issued = new Date('2026-01-15T00:00:00Z');
    expect(computeDueDate(issued, -10)).toEqual(issued);
  });

  it('franchit correctement les mois et les années', () => {
    expect(computeDueDate(new Date('2026-12-20T00:00:00Z'), 30)).toEqual(
      new Date('2027-01-19T00:00:00Z'),
    );
  });
});
