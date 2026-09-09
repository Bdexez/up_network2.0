import { BadRequestException } from '@nestjs/common';
import { round2 } from './totals';

/**
 * Devises proposées. Liste volontairement courte et explicite : une devise
 * inconnue produirait des états inadditionnables.
 */
export const SUPPORTED_CURRENCIES = [
  'EUR',
  'USD',
  'GBP',
  'CHF',
  'CAD',
  'MAD',
  'XOF',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export interface CurrencyContext {
  currency: string;
  /** Taux vers la devise société, figé à la création du document. */
  exchangeRate: number;
}

/**
 * Détermine la devise d'un document et son taux de conversion.
 *
 * Dans la devise de la société, le taux vaut 1 et n'est pas demandé. Dans une
 * autre devise, le taux est obligatoire : le deviner (API externe, dernier
 * taux connu) donnerait des montants qui changent selon le moment du calcul.
 */
export function resolveCurrency(
  companyCurrency: string,
  requested?: { currency?: string; exchangeRate?: number },
): CurrencyContext {
  const currency = (requested?.currency ?? companyCurrency).toUpperCase();

  if (!isSupportedCurrency(currency)) {
    throw new BadRequestException(
      `Devise « ${currency} » non prise en charge. ` +
        `Devises acceptées : ${SUPPORTED_CURRENCIES.join(', ')}.`,
    );
  }

  if (currency === companyCurrency.toUpperCase()) {
    return { currency, exchangeRate: 1 };
  }

  const rate = requested?.exchangeRate;
  if (rate === undefined || rate <= 0) {
    throw new BadRequestException(
      `Un taux de conversion vers ${companyCurrency} est requis pour un document en ${currency}.`,
    );
  }

  return { currency, exchangeRate: rate };
}

/** Montants convertis dans la devise société, pour les états consolidés. */
export function toBaseAmounts(
  totals: { totalHT: number; totalTTC: number },
  exchangeRate: number,
) {
  return {
    baseTotalHT: round2(totals.totalHT * exchangeRate),
    baseTotalTTC: round2(totals.totalTTC * exchangeRate),
  };
}
