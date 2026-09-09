import { BadRequestException } from '@nestjs/common';
import { resolveCurrency, toBaseAmounts } from '../currency';

describe('resolveCurrency', () => {
  it('utilise la devise société par défaut, au taux 1', () => {
    expect(resolveCurrency('EUR')).toEqual({
      currency: 'EUR',
      exchangeRate: 1,
    });
  });

  it('force le taux à 1 dans la devise société, même si un taux est fourni', () => {
    expect(
      resolveCurrency('EUR', { currency: 'EUR', exchangeRate: 3 }),
    ).toEqual({
      currency: 'EUR',
      exchangeRate: 1,
    });
  });

  it('accepte une devise étrangère avec son taux', () => {
    expect(
      resolveCurrency('EUR', { currency: 'USD', exchangeRate: 0.92 }),
    ).toEqual({
      currency: 'USD',
      exchangeRate: 0.92,
    });
  });

  it('normalise la casse', () => {
    expect(
      resolveCurrency('EUR', { currency: 'usd', exchangeRate: 0.92 }).currency,
    ).toBe('USD');
  });

  it('exige un taux pour une devise étrangère', () => {
    expect(() => resolveCurrency('EUR', { currency: 'USD' })).toThrow(
      /taux de conversion vers EUR est requis/,
    );
    expect(() =>
      resolveCurrency('EUR', { currency: 'USD', exchangeRate: 0 }),
    ).toThrow(BadRequestException);
  });

  it('refuse une devise inconnue', () => {
    expect(() =>
      resolveCurrency('EUR', { currency: 'ZZZ', exchangeRate: 1 }),
    ).toThrow(/non prise en charge/);
  });
});

describe('toBaseAmounts', () => {
  it('convertit et arrondit à deux décimales', () => {
    expect(toBaseAmounts({ totalHT: 1000, totalTTC: 1200 }, 0.923)).toEqual({
      baseTotalHT: 923,
      baseTotalTTC: 1107.6,
    });
  });

  it('laisse les montants intacts au taux 1', () => {
    expect(toBaseAmounts({ totalHT: 12.34, totalTTC: 14.81 }, 1)).toEqual({
      baseTotalHT: 12.34,
      baseTotalTTC: 14.81,
    });
  });
});
