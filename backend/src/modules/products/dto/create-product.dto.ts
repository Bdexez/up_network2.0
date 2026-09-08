import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ProductType } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsString()
  @MaxLength(40)
  sku: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  /** Prix de vente hors taxes. */
  @IsNumber()
  @Min(0)
  price: number;

  /** Prix d'achat, base de la valorisation du stock et de la marge. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  vatRate?: number;

  /** Les services ne sont normalement pas suivis en stock. */
  @IsOptional()
  @IsBoolean()
  manageStock?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockAlert?: number;
}
