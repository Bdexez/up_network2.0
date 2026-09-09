import { BadRequestException } from '@nestjs/common';
import {
  assertEditable,
  assertTransition,
  type TransitionMap,
} from '../workflow';

type Status = 'DRAFT' | 'VALIDATED' | 'DONE' | 'CANCELLED';

const LABELS: Record<Status, string> = {
  DRAFT: 'Brouillon',
  VALIDATED: 'Validé',
  DONE: 'Terminé',
  CANCELLED: 'Annulé',
};

const TRANSITIONS: TransitionMap<Status> = {
  DRAFT: ['VALIDATED', 'CANCELLED'],
  VALIDATED: ['DONE', 'DRAFT'],
  CANCELLED: ['DRAFT'],
};

describe('assertTransition', () => {
  it('laisse passer une transition déclarée', () => {
    expect(() =>
      assertTransition('DRAFT', 'VALIDATED', TRANSITIONS, LABELS),
    ).not.toThrow();
  });

  it('accepte une transition vers le même statut', () => {
    expect(() =>
      assertTransition('DONE', 'DONE', TRANSITIONS, LABELS),
    ).not.toThrow();
  });

  it('refuse une transition non déclarée', () => {
    expect(() =>
      assertTransition('DRAFT', 'DONE', TRANSITIONS, LABELS),
    ).toThrow(BadRequestException);
  });

  it('refuse toute sortie d’un statut terminal', () => {
    expect(() =>
      assertTransition('DONE', 'DRAFT', TRANSITIONS, LABELS),
    ).toThrow(/Suites possibles : aucun/);
  });

  it('nomme les statuts en clair dans le message', () => {
    expect(() =>
      assertTransition('DRAFT', 'DONE', TRANSITIONS, LABELS),
    ).toThrow(/« Brouillon » → « Terminé »/);
  });
});

describe('assertEditable', () => {
  it('autorise la modification d’un statut éditable', () => {
    expect(() => assertEditable('DRAFT', ['DRAFT'], LABELS)).not.toThrow();
  });

  it('refuse la modification d’un document figé', () => {
    expect(() => assertEditable('VALIDATED', ['DRAFT'], LABELS)).toThrow(
      /« Validé » : il n'est plus modifiable/,
    );
  });
});
