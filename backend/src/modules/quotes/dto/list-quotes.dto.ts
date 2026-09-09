import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { QuoteStatus } from '@prisma/client';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

export class ListQuotesDto extends PaginationDto {
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  partnerId?: number;
}
