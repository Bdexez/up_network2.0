import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentLineDto } from 'src/common/dto/document-line.dto';
import { computeDocumentTotals, computeLineTotals } from './totals';

/** Ligne prête à être écrite en base, quel que soit le document. */
export interface PersistableLine {
  position: number;
  productId: number | null;
  label: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  vatRate: number;
  totalHT: number;
  totalVat: number;
  totalTTC: number;
}

export interface BuiltDocument {
  lines: PersistableLine[];
  totalHT: number;
  totalVat: number;
  totalTTC: number;
}

@Injectable()
export class DocumentLinesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Complète les lignes reçues avec les données du catalogue et calcule les
   * totaux. Libellé, prix et TVA sont **figés** à cet instant : modifier le
   * produit plus tard ne changera pas un document déjà enregistré.
   *
   * @param useCostPrice prend le prix d'achat comme prix par défaut (achats).
   */
  async build(
    companyId: number,
    lines: DocumentLineDto[],
    { useCostPrice = false }: { useCostPrice?: boolean } = {},
  ): Promise<BuiltDocument> {
    if (lines.length === 0) {
      throw new BadRequestException(
        'Le document doit comporter au moins une ligne',
      );
    }

    const productIds = [
      ...new Set(
        lines.map((line) => line.productId).filter((id): id is number => !!id),
      ),
    ];

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, companyId },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException(
        'Un ou plusieurs produits sont introuvables dans cette société',
      );
    }

    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    const persistable = lines.map((line, index) => {
      const product = line.productId
        ? productById.get(line.productId)
        : undefined;

      const label = line.label?.trim() || product?.name;
      if (!label) {
        throw new BadRequestException(
          `Ligne ${index + 1} : un libellé est requis pour une ligne sans produit`,
        );
      }

      const catalogPrice = product
        ? useCostPrice
          ? product.costPrice
          : product.price
        : undefined;

      const unitPrice = line.unitPrice ?? catalogPrice;
      if (unitPrice === undefined) {
        throw new BadRequestException(
          `Ligne ${index + 1} : un prix unitaire est requis pour une ligne sans produit`,
        );
      }

      const vatRate = line.vatRate ?? product?.vatRate ?? 0;
      const discountPercent = line.discountPercent ?? 0;

      const totals = computeLineTotals({
        quantity: line.quantity,
        unitPrice,
        discountPercent,
        vatRate,
      });

      return {
        position: index,
        productId: line.productId ?? null,
        label,
        quantity: line.quantity,
        unitPrice,
        discountPercent,
        vatRate,
        ...totals,
      } satisfies PersistableLine;
    });

    const totals = computeDocumentTotals(persistable);

    return {
      lines: persistable,
      totalHT: totals.totalHT,
      totalVat: totals.totalVat,
      totalTTC: totals.totalTTC,
    };
  }

  /** Recopie les lignes d'un document vers un autre (devis → commande…). */
  toPersistable(
    lines: {
      productId: number | null;
      label: string;
      quantity: number;
      unitPrice: number;
      discountPercent: number;
      vatRate: number;
    }[],
  ): BuiltDocument {
    const persistable = lines.map((line, index) => ({
      position: index,
      productId: line.productId,
      label: line.label,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discountPercent: line.discountPercent,
      vatRate: line.vatRate,
      ...computeLineTotals(line),
    }));

    const totals = computeDocumentTotals(persistable);

    return {
      lines: persistable,
      totalHT: totals.totalHT,
      totalVat: totals.totalVat,
      totalTTC: totals.totalTTC,
    };
  }
}
