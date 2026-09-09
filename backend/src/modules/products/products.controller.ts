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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { CompanyId } from 'src/common/decorators/current-user.decorator';
import { SearchPaginationDto } from 'src/common/pagination/search-pagination.dto';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('stock')
@ApiBearerAuth()
@Controller('products')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermission('stock', 'products', 'create')
  create(@CompanyId() companyId: number, @Body() dto: CreateProductDto) {
    return this.productsService.create(companyId, dto);
  }

  @Get()
  @RequirePermission('stock', 'products', 'read')
  findAll(@CompanyId() companyId: number, @Query() query: SearchPaginationDto) {
    return this.productsService.findAll(companyId, query);
  }

  /** Catalogue complet et allégé, destiné aux lignes de document. */
  @Get('options')
  @RequirePermission('stock', 'products', 'read')
  findOptions(@CompanyId() companyId: number) {
    return this.productsService.findOptions(companyId);
  }

  @Get(':id')
  @RequirePermission('stock', 'products', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('stock', 'products', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('stock', 'products', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.remove(companyId, id);
  }
}
