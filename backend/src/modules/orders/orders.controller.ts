import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

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
  findAll(@CompanyId() companyId: number) {
    return this.ordersService.findAll(companyId);
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

  @Delete(':id')
  @RequirePermission('sales', 'orders', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.remove(companyId, id);
  }
}
