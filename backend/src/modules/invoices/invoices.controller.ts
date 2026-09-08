import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  UseGuards,
  Res,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { CompanyId } from 'src/common/decorators/current-user.decorator';
import { InvoicesService } from './invoices.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import type { Response } from 'express';
import * as fs from 'fs';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('generate/:orderId')
  @RequirePermission('sales', 'invoices', 'create')
  generate(
    @CompanyId() companyId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.invoicesService.generate(companyId, orderId);
  }

  @Get()
  @RequirePermission('sales', 'invoices', 'read')
  findAll(@CompanyId() companyId: number) {
    return this.invoicesService.findAll(companyId);
  }

  // Déclaré avant `:id` n'est plus nécessaire (le segment est distinct),
  // mais on garde le téléchargement sous l'id pour éviter toute ambiguïté.
  @Get(':id/pdf')
  @RequirePermission('sales', 'invoices', 'read')
  async download(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { filePath, fileName } = await this.invoicesService.getPdfPath(
      companyId,
      id,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`,
    );

    fs.createReadStream(filePath).pipe(res);
  }

  @Get(':id')
  @RequirePermission('sales', 'invoices', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.invoicesService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('sales', 'invoices', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('sales', 'invoices', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.invoicesService.remove(companyId, id);
  }
}
