import { IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  refreshToken: string;
}

export class LogoutDto {
  /** Jeton à révoquer. Absent, la déconnexion est purement côté client. */
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
