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
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermission('stock', 'products', 'create')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @RequirePermission('stock', 'products', 'read')
  findAll(@Query('companyId') companyId: string) {
    const companyIdNumber = Number(companyId);
    if (!companyId || isNaN(companyIdNumber)) {
      throw new BadRequestException(
        'Le paramètre companyId doit être fourni et être un nombre',
      );
    }
    return this.productsService.findAll(companyIdNumber);
  }

  @Get(':id')
  @RequirePermission('stock', 'products', 'read')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(Number(id));
  }

  @Patch(':id')
  @RequirePermission('stock', 'products', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('stock', 'products', 'delete')
  remove(@Param('id') id: string) {
    return this.productsService.remove(Number(id));
  }
}
