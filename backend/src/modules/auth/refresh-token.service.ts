import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from 'src/prisma/prisma.service';

/** Durée de vie d'un jeton de rafraîchissement, en jours. */
const REFRESH_TOKEN_DAYS = 30;

@Injectable()
export class RefreshTokenService {
  constructor(private prisma: PrismaService) {}

  /**
   * Émet un jeton de rafraîchissement.
   *
   * Seul son condensé est stocké : une lecture de la base ne suffit pas à
   * usurper une session, exactement comme pour un mot de passe.
   */
  async issue(userId: number, companyId: number, userAgent?: string) {
    const token = randomBytes(48).toString('base64url');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await this.prisma.refreshToken.create({
      data: { tokenHash: hash(token), userId, companyId, expiresAt, userAgent },
    });

    return { token, expiresAt };
  }

  /**
   * Échange un jeton contre un nouveau, et invalide l'ancien (rotation).
   *
   * Présenter un jeton déjà échangé signale un vol : la session entière est
   * alors révoquée, car on ne sait pas qui, du voleur ou du titulaire, détient
   * le jeton courant.
   */
  async rotate(token: string, userAgent?: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hash(token) },
    });

    if (!stored) {
      throw new UnauthorizedException('Session invalide, reconnectez-vous');
    }

    if (stored.revokedAt) {
      // `replacedById` distingue les deux causes de révocation. Un jeton
      // remplacé par rotation puis rejoué signale un vol : on ferme tout.
      // Un jeton simplement révoqué (déconnexion) est juste périmé — fermer
      // les autres sessions de l'utilisateur serait une punition injustifiée.
      if (stored.replacedById) {
        await this.revokeAllForUser(stored.userId);
        throw new UnauthorizedException(
          'Jeton déjà échangé : toutes les sessions ont été fermées par sécurité',
        );
      }

      throw new UnauthorizedException('Session fermée, reconnectez-vous');
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expirée, reconnectez-vous');
    }

    const next = await this.issue(stored.userId, stored.companyId, userAgent);

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedById: hash(next.token) },
    });

    return { ...next, userId: stored.userId, companyId: stored.companyId };
  }

  /** Révoque un jeton précis : la déconnexion d'un seul appareil. */
  async revoke(token: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hash(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Ferme toutes les sessions d'un compte. */
  async revokeAllForUser(userId: number) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Purge les jetons expirés depuis plus de sept jours. La fenêtre de grâce
   * laisse le temps de détecter un rejeu tardif avant d'effacer la trace.
   */
  async purgeExpired() {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);

    const { count } = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: threshold } },
    });
    return { purged: count };
  }
}

function hash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
