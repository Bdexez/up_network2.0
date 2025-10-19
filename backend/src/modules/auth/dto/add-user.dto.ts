import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class AddUserDto {
  @IsInt()
  userId: number;

  @IsInt()
  companyId: number;

  @IsOptional()
  @IsInt()
  roleId?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
