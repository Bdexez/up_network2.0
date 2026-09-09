import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ExpenseCategory, ExpenseStatus } from '@prisma/client';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

export class ExpenseLineDto {
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @IsDateString()
  date: string;

  @IsString()
  @MaxLength(200)
  description: string;

  @IsNumber()
  @Min(0)
  amountHT: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  vatRate?: number;
}

export class CreateExpenseReportDto {
  /** Omis : la note est créée pour l'employé lié au compte connecté. */
  @IsOptional()
  @IsInt()
  employeeId?: number;

  /** N'importe quelle date du mois concerné ; elle est ramenée au 1er. */
  @IsDateString()
  period: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseLineDto)
  lines?: ExpenseLineDto[];
}

export class UpdateExpenseReportDto {
  @IsOptional()
  @IsDateString()
  period?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  /** Fournies : elles remplacent l'intégralité des lignes existantes. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseLineDto)
  lines?: ExpenseLineDto[];
}

export class ChangeExpenseStatusDto {
  @IsEnum(ExpenseStatus)
  status: ExpenseStatus;
}

export class ListExpenseReportsDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
