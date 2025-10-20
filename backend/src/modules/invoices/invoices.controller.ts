import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { InvoicesService } from './invoices.service';
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

  // ✅ download intégré dans la classe
  @Get('download/:id')
  @RequirePermission('sales', 'invoices', 'read')
  async download(@Param('id') id: string, @Res() res: Response) {
    const invoice = await this.invoicesService.findOne(Number(id));
    if (!invoice) throw new NotFoundException('Facture introuvable');

    const pdfUrl = invoice.pdfUrl;
    if (!pdfUrl) {
      throw new NotFoundException('Aucun fichier PDF associé à cette facture');
    }

    const filePath = path.resolve(pdfUrl);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Fichier PDF introuvable');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice_${invoice.orderId}.pdf"`,
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }
}
