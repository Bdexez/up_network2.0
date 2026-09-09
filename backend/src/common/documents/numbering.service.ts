import { Injectable } from '@nestjs/common';
import { DocumentType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

/** Préfixes des références, dans l'esprit des ERP francophones. */
const PREFIX: Record<DocumentType, string> = {
  QUOTE: 'DE',
  ORDER: 'CO',
  INVOICE: 'FA',
  CREDIT_NOTE: 'AV',
  PURCHASE_ORDER: 'CF',
};

@Injectable()
export class NumberingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Réserve le numéro suivant pour une société, un type et une année :
   * « FA2026-0001 », « CO2026-0042 »…
   *
   * À appeler **dans la transaction qui crée le document**.
   *
   * L'incrément passe par un `INSERT … ON CONFLICT DO UPDATE` : PostgreSQL
   * garantit l'atomicité même quand la ligne de compteur n'existe pas encore.
   * Un `upsert` Prisma ferait un SELECT puis un INSERT ou un UPDATE, ce qui
   * laisse deux transactions simultanées créer la même ligne — la seconde
   * échouerait sur la contrainte d'unicité au tout premier document de l'année.
   */
  async next(
    tx: Prisma.TransactionClient,
    companyId: number,
    type: DocumentType,
    at: Date = new Date(),
  ): Promise<string> {
    const year = at.getFullYear();

    const rows = await tx.$queryRaw<{ value: number }[]>`
      INSERT INTO "DocumentCounter" ("companyId", "type", "year", "value")
      VALUES (${companyId}, ${type}::"DocumentType", ${year}, 1)
      ON CONFLICT ("companyId", "type", "year")
      DO UPDATE SET "value" = "DocumentCounter"."value" + 1
      RETURNING "value"
    `;

    const value = rows[0]?.value ?? 1;
    return `${PREFIX[type]}${year}-${String(value).padStart(4, '0')}`;
  }

  /** Version hors transaction, pour les cas sans autre écriture à grouper. */
  nextStandalone(companyId: number, type: DocumentType, at?: Date) {
    return this.prisma.$transaction((tx) => this.next(tx, companyId, type, at));
  }
}

export { PREFIX as DOCUMENT_PREFIX };
