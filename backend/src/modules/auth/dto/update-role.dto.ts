import { IsInt } from 'class-validator';

export class UpdateRoleDto {
  @IsInt()
  userId: number;

  @IsInt()
  companyId: number;

  @IsInt()
  roleId: number;
}
