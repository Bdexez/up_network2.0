import { BadRequestException } from '@nestjs/common';
import * as path from 'node:path';
import {
  assertAcceptable,
  buildStoragePath,
  resolveStoragePath,
  UPLOADS_DIR,
} from '../attachment-storage';

describe('assertAcceptable', () => {
  it('accepte un PDF de taille raisonnable', () => {
    expect(() =>
      assertAcceptable({ mimetype: 'application/pdf', size: 1024 }),
    ).not.toThrow();
  });

  it('refuse un type non listé', () => {
    expect(() =>
      assertAcceptable({ mimetype: 'application/x-msdownload', size: 10 }),
    ).toThrow(BadRequestException);
  });

  it('refuse un fichier trop volumineux', () => {
    expect(() =>
      assertAcceptable({ mimetype: 'application/pdf', size: 11 * 1024 * 1024 }),
    ).toThrow(/trop volumineux/);
  });
});

describe('buildStoragePath', () => {
  it('cloisonne par société et génère le nom', () => {
    const stored = buildStoragePath(7, 'contrat.pdf');
    expect(stored.startsWith(`company-7${path.sep}`)).toBe(true);
    expect(stored.endsWith('.pdf')).toBe(true);
    expect(stored).not.toContain('contrat');
  });

  it('ne reprend jamais un nom de fichier hostile', () => {
    const stored = buildStoragePath(1, '../../etc/passwd');
    expect(stored).not.toContain('..');
    expect(stored.startsWith(`company-1${path.sep}`)).toBe(true);
  });

  it('ignore une extension farfelue', () => {
    // « .gz;rm -rf » n'est pas une extension : elle est écartée.
    expect(buildStoragePath(1, 'fichier.tar.gz;rm -rf')).not.toContain(';');
    expect(buildStoragePath(1, 'sans-extension')).toContain('company-1');
  });

  it('produit un chemin différent à chaque appel', () => {
    expect(buildStoragePath(1, 'a.pdf')).not.toBe(buildStoragePath(1, 'a.pdf'));
  });
});

describe('resolveStoragePath', () => {
  it('résout un chemin légitime', () => {
    expect(resolveStoragePath('company-1/abc.pdf')).toBe(
      path.join(UPLOADS_DIR, 'company-1', 'abc.pdf'),
    );
  });

  it('refuse une remontée de dossier', () => {
    expect(resolveStoragePath('../../etc/passwd')).toBeNull();
    expect(resolveStoragePath('company-1/../../../etc/shadow')).toBeNull();
  });

  it('refuse un chemin absolu', () => {
    expect(resolveStoragePath('/etc/passwd')).toBeNull();
  });
});
