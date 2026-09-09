import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AttachmentEntity } from '@prisma/client';

export class UploadAttachmentDto {
  @IsEnum(AttachmentEntity)
  entity: AttachmentEntity;

  @Type(() => Number)
  @IsInt()
  entityId: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

export class ListAttachmentsDto {
  @IsEnum(AttachmentEntity)
  entity: AttachmentEntity;

  @Type(() => Number)
  @IsInt()
  entityId: number;
}
