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
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { StockService } from './stock.service';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
import { AdjustStockDto, TransferStockDto } from './dto/adjust-stock.dto';

@Controller('stock')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly warehousesService: WarehousesService,
  ) {}

  // --- Niveaux et mouvements -----------------------------------------------

  @Get('levels')
  @RequirePermission('stock', 'stock', 'read')
  levels(
    @CompanyId() companyId: number,
    @Query('warehouseId') warehouseId?: string,
    @Query('search') search?: string,
    @Query('belowAlert') belowAlert?: string,
  ) {
    return this.stockService.levels(companyId, {
      warehouseId: warehouseId ? Number(warehouseId) : undefined,
      search,
      belowAlert: belowAlert === 'true',
    });
  }

  @Get('movements')
  @RequirePermission('stock', 'stock', 'read')
  movements(
    @CompanyId() companyId: number,
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stockService.movements(companyId, {
      productId: productId ? Number(productId) : undefined,
      warehouseId: warehouseId ? Number(warehouseId) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('adjust')
  @RequirePermission('stock', 'stock', 'update')
  adjust(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: AdjustStockDto,
  ) {
    return this.stockService.adjust(companyId, userId, dto);
  }

  @Post('transfer')
  @RequirePermission('stock', 'stock', 'update')
  transfer(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: TransferStockDto,
  ) {
    return this.stockService.transfer(companyId, userId, dto);
  }

  // --- Entrepôts ------------------------------------------------------------

  @Get('warehouses')
  @RequirePermission('stock', 'warehouses', 'read')
  findWarehouses(@CompanyId() companyId: number) {
    return this.warehousesService.findAll(companyId);
  }

  @Post('warehouses')
  @RequirePermission('stock', 'warehouses', 'create')
  createWarehouse(@CompanyId() companyId: number, @Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(companyId, dto);
  }

  @Get('warehouses/:id')
  @RequirePermission('stock', 'warehouses', 'read')
  findWarehouse(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.warehousesService.findOne(companyId, id);
  }

  @Patch('warehouses/:id')
  @RequirePermission('stock', 'warehouses', 'update')
  updateWarehouse(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(companyId, id, dto);
  }

  @Delete('warehouses/:id')
  @RequirePermission('stock', 'warehouses', 'delete')
  removeWarehouse(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.warehousesService.remove(companyId, id);
  }
}
