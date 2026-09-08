import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ActivityStatus, ActivityType } from '@prisma/client';

export class CreateActivityDto {
  @IsString()
  @MaxLength(160)
  subject: string;

  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  ownerId?: number;

  // Rattachement : au moins un des trois (validé côté service).
  @IsOptional()
  @IsInt()
  leadId?: number;

  @IsOptional()
  @IsInt()
  opportunityId?: number;

  @IsOptional()
  @IsInt()
  partnerId?: number;
}
