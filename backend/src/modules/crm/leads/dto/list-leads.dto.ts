import { IsEnum, IsOptional } from 'class-validator';
import { LeadStatus } from '@prisma/client';
import { SearchPaginationDto } from 'src/common/pagination/search-pagination.dto';

export class ListLeadsDto extends SearchPaginationDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
}
