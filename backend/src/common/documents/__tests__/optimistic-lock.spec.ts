import { ConflictException } from '@nestjs/common';
import { assertVersion } from '../optimistic-lock';

describe('assertVersion', () => {
  const document = { ref: 'FA2026-0001', version: 3 };

  it('laisse passer quand les versions concordent', () => {
    expect(() => assertVersion(document, 3)).not.toThrow();
  });

  it('laisse passer quand aucune version n’est fournie', () => {
    expect(() => assertVersion(document, undefined)).not.toThrow();
  });

  it('refuse une version périmée', () => {
    expect(() => assertVersion(document, 2)).toThrow(ConflictException);
  });

  it('nomme le document et les deux versions', () => {
    expect(() => assertVersion(document, 2)).toThrow(
      /FA2026-0001.*version 3.*vôtre 2/,
    );
  });
});
