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
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { ListLeadsDto } from './dto/list-leads.dto';

@ApiTags('crm')
@ApiBearerAuth()
@Controller('crm/leads')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @RequirePermission('crm', 'leads', 'create')
  create(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateLeadDto,
  ) {
    return this.leadsService.create(companyId, userId, dto);
  }

  @Get()
  @RequirePermission('crm', 'leads', 'read')
  findAll(@CompanyId() companyId: number, @Query() query: ListLeadsDto) {
    return this.leadsService.findAll(companyId, query);
  }

  @Get('stats')
  @RequirePermission('crm', 'leads', 'read')
  stats(@CompanyId() companyId: number) {
    return this.leadsService.statsByStatus(companyId);
  }

  @Get(':id')
  @RequirePermission('crm', 'leads', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.leadsService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('crm', 'leads', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(companyId, id, dto);
  }

  @Post(':id/convert')
  @RequirePermission('crm', 'leads', 'convert')
  convert(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConvertLeadDto,
  ) {
    return this.leadsService.convert(companyId, userId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('crm', 'leads', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.leadsService.remove(companyId, id);
  }
}
