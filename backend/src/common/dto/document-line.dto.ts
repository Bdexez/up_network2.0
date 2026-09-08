import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Ligne d'un document commercial. Partagée par les devis, commandes, factures
 * et commandes fournisseur : leurs lignes ont exactement la même forme.
 */
export class DocumentLineDto {
  /** Article du catalogue ; absent pour une ligne libre. */
  @IsOptional()
  @IsInt()
  productId?: number;

  /** Repris du produit s'il est fourni, obligatoire sinon. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  /** Prix unitaire HT ; à défaut, le tarif catalogue du produit. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  vatRate?: number;
}
