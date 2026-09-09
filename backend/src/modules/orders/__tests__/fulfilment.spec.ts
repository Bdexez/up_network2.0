import { BadRequestException } from '@nestjs/common';
import {
  isFullyFulfilled,
  remainingOn,
  resolveFulfilment,
  type FulfilableLine,
} from '../fulfilment';

const line = (over: Partial<FulfilableLine> = {}): FulfilableLine => ({
  id: 1,
  label: 'Article',
  quantity: 10,
  shippedQuantity: 0,
  invoicedQuantity: 0,
  ...over,
});

describe('remainingOn', () => {
  it('calcule le reliquat par dimension', () => {
    const l = line({ shippedQuantity: 4, invoicedQuantity: 7 });
    expect(remainingOn(l, 'shipped')).toBe(6);
    expect(remainingOn(l, 'invoiced')).toBe(3);
  });
});

describe('isFullyFulfilled', () => {
  it('détecte une commande entièrement expédiée', () => {
    expect(isFullyFulfilled([line({ shippedQuantity: 10 })], 'shipped')).toBe(
      true,
    );
  });

  it('reste faux tant qu’une ligne a du reliquat', () => {
    expect(
      isFullyFulfilled(
        [line({ shippedQuantity: 10 }), line({ id: 2 })],
        'shipped',
      ),
    ).toBe(false);
  });
});

describe('resolveFulfilment', () => {
  it('prend tout le reliquat sans sélection', () => {
    const lines = [line({ shippedQuantity: 4 }), line({ id: 2, quantity: 3 })];
    expect(resolveFulfilment(lines, 'shipped')).toEqual([
      { line: lines[0], quantity: 6 },
      { line: lines[1], quantity: 3 },
    ]);
  });

  it('ignore les lignes déjà soldées', () => {
    const lines = [line({ shippedQuantity: 10 }), line({ id: 2, quantity: 5 })];
    expect(resolveFulfilment(lines, 'shipped')).toHaveLength(1);
  });

  it('respecte une sélection partielle', () => {
    const lines = [line()];
    expect(
      resolveFulfilment(lines, 'shipped', [{ lineId: 1, quantity: 4 }]),
    ).toEqual([{ line: lines[0], quantity: 4 }]);
  });

  it('refuse une quantité supérieure au reliquat', () => {
    const lines = [line({ shippedQuantity: 8 })];
    expect(() =>
      resolveFulfilment(lines, 'shipped', [{ lineId: 1, quantity: 5 }]),
    ).toThrow(/reliquat de 2/);
  });

  it('refuse une ligne étrangère à la commande', () => {
    expect(() =>
      resolveFulfilment([line()], 'shipped', [{ lineId: 99, quantity: 1 }]),
    ).toThrow(BadRequestException);
  });

  it('refuse une sélection entièrement nulle', () => {
    expect(() =>
      resolveFulfilment([line()], 'invoiced', [{ lineId: 1, quantity: 0 }]),
    ).toThrow(/Aucune quantité à facturer/);
  });
});
