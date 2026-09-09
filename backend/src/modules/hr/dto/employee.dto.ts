import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SearchPaginationDto } from 'src/common/pagination/search-pagination.dto';

export class CreateEmployeeDto {
  @IsString()
  @MaxLength(80)
  firstName: string;

  @IsString()
  @MaxLength(80)
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  /** Compte applicatif à rattacher, si l'employé se connecte à l'ERP. */
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidLeaveBalance?: number;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidLeaveBalance?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListEmployeesDto extends SearchPaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  /** Absent : tout le monde. `?isActive=true` : seulement ceux en poste. */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}
