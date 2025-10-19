import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsInt()
  companyId: number;
}
