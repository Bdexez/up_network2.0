import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsNumber,
  Length,
  Min,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PurchaseOrderStatus } from '@prisma/client';
import { DocumentLineDto } from 'src/common/dto/document-line.dto';

export class CreatePurchaseOrderDto {
  @IsInt()
  supplierId: number;

  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DocumentLineDto)
  lines: DocumentLineDto[];
  /** Devise du document ; à défaut, celle de la société. */
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  /** Taux vers la devise société. Requis pour une devise étrangère. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number;
}

export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsInt()
  supplierId?: number;

  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /** Si fourni, remplace intégralement les lignes. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DocumentLineDto)
  lines?: DocumentLineDto[];
  /**
   * Version lue par le client. Fournie, elle protège d'un écrasement
   * concurrent ; omise, la modification est appliquée sans contrôle.
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  version?: number;
}

export class ChangePurchaseStatusDto {
  @IsEnum(PurchaseOrderStatus)
  status: PurchaseOrderStatus;
}

export class ReceivePurchaseOrderDto {
  /** Entrepôt à créditer ; à défaut celui de la commande, sinon le défaut. */
  @IsOptional()
  @IsInt()
  warehouseId?: number;
}
