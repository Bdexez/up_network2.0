import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

export class ListInvoicesDto extends PaginationDto {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  partnerId?: number;

  /** `?overdue=true` : uniquement les factures dont l'échéance est dépassée. */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  overdue?: boolean;
}
