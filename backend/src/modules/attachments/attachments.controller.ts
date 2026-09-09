import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import * as fs from 'node:fs';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import {
  AttachmentsService,
  type UploadedFile as StoredFile,
} from './attachments.service';
import { ListAttachmentsDto, UploadAttachmentDto } from './dto/attachment.dto';
import { MAX_FILE_SIZE } from './attachment-storage';

@ApiTags('attachments')
@ApiBearerAuth()
@Controller('attachments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /**
   * Dépôt d'un fichier. Le corps est en `multipart/form-data` : le fichier
   * sous la clé `file`, les métadonnées en champs de formulaire.
   */
  @Post()
  @RequirePermission('documents', 'attachments', 'create')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }),
  )
  upload(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @UploadedFile() file: StoredFile | undefined,
    @Body() dto: UploadAttachmentDto,
  ) {
    return this.attachmentsService.upload(companyId, userId, file, dto);
  }

  @Get()
  @RequirePermission('documents', 'attachments', 'read')
  findAll(@CompanyId() companyId: number, @Query() query: ListAttachmentsDto) {
    return this.attachmentsService.findAll(
      companyId,
      query.entity,
      query.entityId,
    );
  }

  @Get(':id/download')
  @RequirePermission('documents', 'attachments', 'read')
  async download(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { filePath, fileName, mimeType } =
      await this.attachmentsService.getFile(companyId, id);

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    fs.createReadStream(filePath).pipe(res);
  }

  @Delete(':id')
  @RequirePermission('documents', 'attachments', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.attachmentsService.remove(companyId, id);
  }
}
