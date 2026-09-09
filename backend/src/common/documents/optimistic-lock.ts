import { ConflictException } from '@nestjs/common';

/**
 * Verrou optimiste sur un document.
 *
 * Le client renvoie la `version` qu'il a lue ; si elle ne correspond plus, un
 * autre utilisateur a enregistré entre-temps et on refuse plutôt que d'écraser
 * son travail en silence. Sans `version` fournie, on laisse passer : c'est le
 * comportement d'un appel qui ne se soucie pas de concurrence (script, import).
 */
export function assertVersion(
  document: { ref: string; version: number },
  provided: number | undefined,
): void {
  if (provided === undefined || provided === document.version) return;

  throw new ConflictException(
    `Le document ${document.ref} a été modifié entre-temps ` +
      `(version ${document.version}, la vôtre ${provided}). ` +
      'Rechargez-le avant d’enregistrer.',
  );
}
