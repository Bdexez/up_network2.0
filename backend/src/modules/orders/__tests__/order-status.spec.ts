import { OrderStatus } from '@prisma/client';
import {
  ORDER_EDITABLE,
  ORDER_SHIPPABLE,
  ORDER_STATUS_LABEL,
  ORDER_TRANSITIONS,
} from '../order-status';

describe('ORDER_SHIPPABLE', () => {
  it('autorise l’expédition d’une commande facturée avant livraison', () => {
    // Le cas du règlement d'avance : la facture part la première, la
    // marchandise doit malgré tout pouvoir sortir du stock.
    expect(ORDER_SHIPPABLE).toContain(OrderStatus.BILLED);
  });

  it('autorise un reliquat sur une commande déjà partiellement expédiée', () => {
    expect(ORDER_SHIPPABLE).toContain(OrderStatus.SHIPPED);
  });

  it('refuse un brouillon ou une commande annulée', () => {
    expect(ORDER_SHIPPABLE).not.toContain(OrderStatus.DRAFT);
    expect(ORDER_SHIPPABLE).not.toContain(OrderStatus.CANCELLED);
  });
});

describe('ORDER_TRANSITIONS', () => {
  it('nomme chaque statut du cycle de vie', () => {
    for (const status of Object.values(OrderStatus)) {
      expect(ORDER_STATUS_LABEL[status]).toBeTruthy();
    }
  });

  it('ne laisse modifier les lignes qu’au brouillon', () => {
    expect(ORDER_EDITABLE).toEqual([OrderStatus.DRAFT]);
  });

  it('ne propose aucun retour depuis « expédiée » — le stock est sorti', () => {
    expect(ORDER_TRANSITIONS.SHIPPED).not.toContain(OrderStatus.DRAFT);
  });
});
