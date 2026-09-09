import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LeaveStatus, LeaveType } from '@prisma/client';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

export class CreateLeaveRequestDto {
  /** Omis : la demande est déposée pour l'employé lié au compte connecté. */
  @IsOptional()
  @IsInt()
  employeeId?: number;

  @IsOptional()
  @IsEnum(LeaveType)
  type?: LeaveType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}

/**
 * Décision d'un responsable. `CANCELLED` est aussi une décision recevable :
 * c'est le retrait d'une demande, avant ou après approbation.
 */
export class DecideLeaveDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  decisionNote?: string;
}

export class ListLeaveRequestsDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;

  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @IsOptional()
  @IsEnum(LeaveType)
  type?: LeaveType;

  /** Demandes chevauchant la période : le planning d'un mois, par exemple. */
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
