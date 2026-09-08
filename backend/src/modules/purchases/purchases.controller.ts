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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PurchaseOrderStatus } from '@prisma/client';
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
  findAll(@CompanyId() companyId: number, @Query('status') status?: PurchaseOrderStatus) {
    return this.purchasesService.findAll(companyId, { status });
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
    return this.purchasesService.receive(companyId, userId, id, dto.warehouseId);
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
