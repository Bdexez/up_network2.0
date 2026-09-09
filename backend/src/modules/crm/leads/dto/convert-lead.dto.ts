import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ConvertLeadDto {
  /**
   * Rattacher la piste à un client existant plutôt que d'en créer un.
   * Si absent, un client est créé à partir des infos de la piste.
   */
  @IsOptional()
  @IsNumber()
  partnerId?: number;

  /** Créer aussi une opportunité dans le pipeline (vrai par défaut). */
  @IsOptional()
  @IsBoolean()
  createOpportunity?: boolean;

  @IsOptional()
  @IsString()
  opportunityName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
