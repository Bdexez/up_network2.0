import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsNumber,
  Length,
  Min,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DocumentLineDto } from 'src/common/dto/document-line.dto';

export class CreateOrderDto {
  @IsInt()
  partnerId: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

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
