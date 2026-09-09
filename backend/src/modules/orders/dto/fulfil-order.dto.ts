import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

/** Quantité traitée sur une ligne de commande donnée. */
export class FulfilLineDto {
  @IsInt()
  lineId: number;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class ShipOrderDto {
  /** Entrepôt à décrémenter ; à défaut, l'entrepôt par défaut de la société. */
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  /**
   * Lignes et quantités à expédier. Omises, tout le reliquat part d'un coup ;
   * fournies, elles permettent une expédition partielle.
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FulfilLineDto)
  lines?: FulfilLineDto[];
}

export class InvoiceOrderDto {
  /**
   * Lignes et quantités à facturer. Omises, tout le reste à facturer est
   * repris ; fournies, elles permettent une facturation partielle (acompte,
   * livraison échelonnée).
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FulfilLineDto)
  lines?: FulfilLineDto[];
}
