import { InvoiceStatus } from '@prisma/client';
import { creditableAmount, type IssuedCreditNote } from '../credit-notes';

const note = (
  totalTTC: number,
  status: InvoiceStatus = InvoiceStatus.UNPAID,
): IssuedCreditNote => ({
  status,
  totalTTC,
});

describe('creditableAmount', () => {
  it('rend le total de la facture quand aucun avoir n’existe', () => {
    expect(creditableAmount(1200, [])).toBe(1200);
  });

  it('déduit les avoirs déjà émis', () => {
    expect(creditableAmount(1200, [note(200), note(300)])).toBe(700);
  });

  it('tombe à zéro sur une facture entièrement avoirée', () => {
    expect(creditableAmount(1200, [note(1200)])).toBe(0);
  });

  it('ignore un avoir annulé : il ne corrige plus rien', () => {
    expect(creditableAmount(1200, [note(1200, InvoiceStatus.CANCELLED)])).toBe(
      1200,
    );
  });

  it('arrondit au centime', () => {
    expect(creditableAmount(100, [note(33.33), note(33.33)])).toBe(33.34);
  });
});
