import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @RequirePermission('sales', 'orders', 'create')
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  @RequirePermission('sales', 'orders', 'read')
  findAll(@Query('companyId') companyId: string) {
    return this.ordersService.findAll(Number(companyId));
  }

  @Get(':id')
  @RequirePermission('sales', 'orders', 'read')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(Number(id));
  }

  @Patch(':id')
  @RequirePermission('sales', 'orders', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('sales', 'orders', 'delete')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(Number(id));
  }
}
