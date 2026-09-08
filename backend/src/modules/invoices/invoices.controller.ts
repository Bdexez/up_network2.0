import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvoiceStatus } from '@prisma/client';
import type { Response } from 'express';
import * as fs from 'fs';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { InvoicesService } from './invoices.service';
import { PaymentsService } from './payments.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { ChangeInvoiceStatusDto } from './dto/change-invoice-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @RequirePermission('sales', 'invoices', 'create')
  create(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(companyId, userId, dto);
  }

  @Get()
  @RequirePermission('sales', 'invoices', 'read')
  findAll(
    @CompanyId() companyId: number,
    @Query('status') status?: InvoiceStatus,
    @Query('partnerId') partnerId?: string,
    @Query('overdue') overdue?: string,
  ) {
    return this.invoicesService.findAll(companyId, {
      status,
      partnerId: partnerId ? Number(partnerId) : undefined,
      overdue: overdue === 'true',
    });
  }

  // Déclaré avant `:id` pour lever toute ambiguïté de routage.
  @Get(':id/pdf')
  @RequirePermission('sales', 'invoices', 'read')
  async download(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { filePath, fileName } = await this.invoicesService.getPdfPath(companyId, id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
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

  @Patch(':id/status')
  @RequirePermission('sales', 'invoices', 'update')
  changeStatus(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeInvoiceStatusDto,
  ) {
    return this.invoicesService.changeStatus(companyId, id, dto.status);
  }

  @Delete(':id')
  @RequirePermission('sales', 'invoices', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.invoicesService.remove(companyId, id);
  }

  // --- Règlements ------------------------------------------------------------

  @Get(':id/payments')
  @RequirePermission('sales', 'payments', 'read')
  findPayments(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentsService.findAll(companyId, id);
  }

  @Post(':id/payments')
  @RequirePermission('sales', 'payments', 'create')
  addPayment(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(companyId, userId, id, dto);
  }

  @Delete(':id/payments/:paymentId')
  @RequirePermission('sales', 'payments', 'delete')
  removePayment(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return this.paymentsService.remove(companyId, id, paymentId);
  }
}
