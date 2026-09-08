import { Injectable } from '@nestjs/common';
import { DocumentType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

/** Préfixes des références, dans l'esprit des ERP francophones. */
const PREFIX: Record<DocumentType, string> = {
  QUOTE: 'DE',
  ORDER: 'CO',
  INVOICE: 'FA',
  PURCHASE_ORDER: 'CF',
};

@Injectable()
export class NumberingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Réserve le numéro suivant pour une société, un type et une année :
   * « FA2026-0001 », « CO2026-0042 »…
   *
   * À appeler **dans la transaction qui crée le document** : l'upsert prend un
   * verrou sur la ligne de compteur, ce qui sérialise deux créations
   * simultanées et empêche deux documents de porter la même référence.
   */
  async next(
    tx: Prisma.TransactionClient,
    companyId: number,
    type: DocumentType,
    at: Date = new Date(),
  ): Promise<string> {
    const year = at.getFullYear();

    const counter = await tx.documentCounter.upsert({
      where: { companyId_type_year: { companyId, type, year } },
      update: { value: { increment: 1 } },
      create: { companyId, type, year, value: 1 },
    });

    return `${PREFIX[type]}${year}-${String(counter.value).padStart(4, '0')}`;
  }

  /** Version hors transaction, pour les cas sans autre écriture à grouper. */
  nextStandalone(companyId: number, type: DocumentType, at?: Date) {
    return this.prisma.$transaction((tx) => this.next(tx, companyId, type, at));
  }
}

export { PREFIX as DOCUMENT_PREFIX };
