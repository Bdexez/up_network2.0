import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { ActivityStatus, ActivityType } from '@prisma/client';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

export class ListActivitiesDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  leadId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  opportunityId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  partnerId?: number;

  /** `?upcoming=true` : uniquement les activités planifiées avec échéance. */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  upcoming?: boolean;
}
