import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
  Res,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('generate/:orderId')
  @RequirePermission('sales', 'invoices', 'create')
  generate(@Param('orderId') orderId: string) {
    return this.invoicesService.generate(Number(orderId));
  }

  @Get()
  @RequirePermission('sales', 'invoices', 'read')
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @RequirePermission('sales', 'invoices', 'read')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(Number(id));
  }

  @Patch(':id')
  @RequirePermission('sales', 'invoices', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('sales', 'invoices', 'delete')
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(Number(id));
  }

  @Get('download/:id')
  @RequirePermission('sales', 'invoices', 'read')
  async download(@Param('id') id: string, @Res() res: Response) {
    const invoice = await this.invoicesService.findOne(Number(id));
    if (!invoice) throw new NotFoundException('Facture introuvable');

    const pdfUrl = invoice.pdfUrl;
    if (!pdfUrl) throw new NotFoundException('Aucun fichier PDF associé');

    const filePath = path.resolve(pdfUrl);
    if (!fs.existsSync(filePath))
      throw new NotFoundException('Fichier PDF introuvable');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice_${invoice.orderId}.pdf"`,
    );

    fs.createReadStream(filePath).pipe(res);
  }
}
