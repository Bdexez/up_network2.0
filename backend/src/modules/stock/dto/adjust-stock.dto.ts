import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AdjustStockDto {
  @IsInt()
  productId: number;

  @IsInt()
  warehouseId: number;

  /** Quantité signée : positive pour une entrée, négative pour une sortie. */
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  reason?: string;
}

export class TransferStockDto {
  @IsInt()
  productId: number;

  @IsInt()
  fromWarehouseId: number;

  @IsInt()
  toWarehouseId: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  reason?: string;
}
