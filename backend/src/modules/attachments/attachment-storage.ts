import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as path from 'node:path';

export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

/** 10 Mo : au-delà, un document commercial relève du partage de fichiers. */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Types acceptés. Liste blanche plutôt que liste noire : un type inattendu
 * est refusé, jamais servi « au cas où ».
 */
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export function assertAcceptable(file: { mimetype: string; size: number }) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new BadRequestException(
      `Type de fichier non accepté (${file.mimetype}). ` +
        'Formats admis : PDF, images, texte, CSV, Word, Excel.',
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestException(
      `Fichier trop volumineux (${Math.round(file.size / 1024 / 1024)} Mo, maximum 10 Mo).`,
    );
  }
}

/**
 * Chemin de stockage : cloisonné par société, nom généré.
 *
 * On ne réutilise jamais le nom fourni par l'utilisateur sur le disque : il
 * pourrait contenir `../`, un caractère nul, ou écraser un fichier existant.
 * Le nom d'origine reste en base, pour le téléchargement.
 */
export function buildStoragePath(
  companyId: number,
  originalName: string,
): string {
  const extension = path.extname(originalName).toLowerCase().slice(0, 10);
  const safeExtension = /^\.[a-z0-9]+$/.test(extension) ? extension : '';
  return path.join(`company-${companyId}`, `${randomUUID()}${safeExtension}`);
}

/** Résout un chemin stocké en refusant toute sortie du dossier d'uploads. */
export function resolveStoragePath(stored: string): string | null {
  const resolved = path.resolve(UPLOADS_DIR, stored);
  const root = path.resolve(UPLOADS_DIR) + path.sep;
  return resolved.startsWith(root) ? resolved : null;
}
