import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  Min,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DocumentLineDto } from 'src/common/dto/document-line.dto';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsInt()
  partnerId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /** Si fourni, remplace intégralement les lignes de la facture. */
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
