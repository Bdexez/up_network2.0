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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { PurchasesService } from './purchases.service';
import {
  ChangePurchaseStatusDto,
  CreatePurchaseOrderDto,
  ReceivePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from './dto/purchase-order.dto';
import { ListPurchaseOrdersDto } from './dto/list-purchases.dto';

@ApiTags('purchases')
@ApiBearerAuth()
@Controller('purchases')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @RequirePermission('purchases', 'orders', 'create')
  create(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    return this.purchasesService.create(companyId, userId, dto);
  }

  @Get()
  @RequirePermission('purchases', 'orders', 'read')
  findAll(
    @CompanyId() companyId: number,
    @Query() query: ListPurchaseOrdersDto,
  ) {
    return this.purchasesService.findAll(companyId, query);
  }

  @Get(':id/pdf')
  @RequirePermission('purchases', 'orders', 'read')
  async downloadPdf(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { buffer, fileName } = await this.purchasesService.renderPdf(
      companyId,
      id,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  }

  @Get(':id')
  @RequirePermission('purchases', 'orders', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.purchasesService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('purchases', 'orders', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseOrderDto,
  ) {
    return this.purchasesService.update(companyId, id, dto);
  }

  @Patch(':id/status')
  @RequirePermission('purchases', 'orders', 'update')
  changeStatus(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangePurchaseStatusDto,
  ) {
    return this.purchasesService.changeStatus(companyId, id, dto.status);
  }

  @Post(':id/receive')
  @RequirePermission('purchases', 'orders', 'update')
  receive(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReceivePurchaseOrderDto,
  ) {
    return this.purchasesService.receive(
      companyId,
      userId,
      id,
      dto.warehouseId,
    );
  }

  @Delete(':id')
  @RequirePermission('purchases', 'orders', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.purchasesService.remove(companyId, id);
  }
}
