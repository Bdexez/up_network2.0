import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DocumentLineDto } from 'src/common/dto/document-line.dto';

export class CreateCreditNoteDto {
  /**
   * Lignes de l'avoir. Omises, elles reprennent l'intégralité de la facture
   * (avoir total) ; fournies, elles permettent un avoir partiel.
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DocumentLineDto)
  lines?: DocumentLineDto[];

  @IsOptional()
  @IsString()
  reason?: string;
}
