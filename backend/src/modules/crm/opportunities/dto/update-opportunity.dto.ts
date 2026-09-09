import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { OpportunityStage } from '@prisma/client';

/** Tous les champs sont facultatifs : seuls ceux fournis sont modifiés. */
export class UpdateOpportunityDto {
  @IsOptional()
  @IsString()
  @MaxLength(140)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsInt()
  partnerId?: number;

  @IsOptional()
  @IsInt()
  ownerId?: number;

  /** Renseigné quand on bascule l'opportunité en LOST. */
  @IsOptional()
  @IsString()
  lostReason?: string;
}
