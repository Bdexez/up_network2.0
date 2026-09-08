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
import { CompanyId } from 'src/common/decorators/current-user.decorator';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Controller('partners')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @RequirePermission('crm', 'partners', 'create')
  create(@CompanyId() companyId: number, @Body() dto: CreatePartnerDto) {
    return this.partnersService.create(companyId, dto);
  }

  @Get()
  @RequirePermission('crm', 'partners', 'read')
  findAll(@CompanyId() companyId: number, @Query('search') search?: string) {
    return this.partnersService.findAll(companyId, search);
  }

  @Get(':id')
  @RequirePermission('crm', 'partners', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.partnersService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('crm', 'partners', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('crm', 'partners', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.partnersService.remove(companyId, id);
  }
}
