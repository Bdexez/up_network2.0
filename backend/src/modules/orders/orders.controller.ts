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
import { OrderStatus } from '@prisma/client';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { ShipOrderDto } from './dto/ship-order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @RequirePermission('sales', 'orders', 'create')
  create(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(companyId, userId, dto);
  }

  @Get()
  @RequirePermission('sales', 'orders', 'read')
  findAll(
    @CompanyId() companyId: number,
    @Query('status') status?: OrderStatus,
    @Query('partnerId') partnerId?: string,
  ) {
    return this.ordersService.findAll(companyId, {
      status,
      partnerId: partnerId ? Number(partnerId) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('sales', 'orders', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('sales', 'orders', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.update(companyId, id, dto);
  }

  @Patch(':id/status')
  @RequirePermission('sales', 'orders', 'update')
  changeStatus(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeOrderStatusDto,
  ) {
    return this.ordersService.changeStatus(companyId, id, dto.status);
  }

  @Post(':id/ship')
  @RequirePermission('sales', 'orders', 'update')
  ship(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ShipOrderDto,
  ) {
    return this.ordersService.ship(companyId, userId, id, dto.warehouseId);
  }

  @Post(':id/invoice')
  @RequirePermission('sales', 'invoices', 'create')
  convertToInvoice(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.convertToInvoice(companyId, userId, id);
  }

  @Delete(':id')
  @RequirePermission('sales', 'orders', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.remove(companyId, id);
  }
}
