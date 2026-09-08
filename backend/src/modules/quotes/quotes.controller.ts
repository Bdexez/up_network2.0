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
import { QuoteStatus } from '@prisma/client';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { ChangeQuoteStatusDto } from './dto/change-quote-status.dto';

@Controller('quotes')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @RequirePermission('sales', 'quotes', 'create')
  create(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateQuoteDto,
  ) {
    return this.quotesService.create(companyId, userId, dto);
  }

  @Get()
  @RequirePermission('sales', 'quotes', 'read')
  findAll(
    @CompanyId() companyId: number,
    @Query('status') status?: QuoteStatus,
    @Query('partnerId') partnerId?: string,
  ) {
    return this.quotesService.findAll(companyId, {
      status,
      partnerId: partnerId ? Number(partnerId) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('sales', 'quotes', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quotesService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('sales', 'quotes', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(companyId, id, dto);
  }

  @Patch(':id/status')
  @RequirePermission('sales', 'quotes', 'update')
  changeStatus(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeQuoteStatusDto,
  ) {
    return this.quotesService.changeStatus(companyId, id, dto.status);
  }

  @Post(':id/convert')
  @RequirePermission('sales', 'orders', 'create')
  convert(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quotesService.convertToOrder(companyId, userId, id);
  }

  @Delete(':id')
  @RequirePermission('sales', 'quotes', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quotesService.remove(companyId, id);
  }
}
