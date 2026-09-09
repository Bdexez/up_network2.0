import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { OpportunityStage } from '@prisma/client';
import { SearchPaginationDto } from 'src/common/pagination/search-pagination.dto';

export class ListOpportunitiesDto extends SearchPaginationDto {
  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  /** `?open=true` : uniquement les affaires ni gagnées ni perdues. */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  open?: boolean;
}
