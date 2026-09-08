import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  /**
   * Nom de la société à créer. Si omis, on dérive un nom depuis le username.
   * Ignoré quand `companyCode` est fourni.
   */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  companyName?: string;

  /**
   * Code d'une société existante à rejoindre. L'utilisateur y entre alors
   * sans rôle : un admin devra lui en attribuer un.
   */
  @IsOptional()
  @IsString()
  companyCode?: string;
}
