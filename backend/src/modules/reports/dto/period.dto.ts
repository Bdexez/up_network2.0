import { IsDateString, IsOptional } from 'class-validator';

/** Bornes d'un état comptable. Par défaut : l'exercice civil en cours. */
export class PeriodDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
