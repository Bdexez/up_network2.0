import {
  IsBoolean,
  Length,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  vatNumber?: string;

  /// Taux de TVA proposé par défaut sur les nouveaux produits.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  defaultVatRate?: number;

  /// Délai de règlement appliqué aux factures, en jours.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  paymentTermsDays?: number;

  /// Devise de tenue de comptes (code ISO à trois lettres).
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  /// Autorise une sortie de stock supérieure au disponible.
  @IsOptional()
  @IsBoolean()
  allowNegativeStock?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
