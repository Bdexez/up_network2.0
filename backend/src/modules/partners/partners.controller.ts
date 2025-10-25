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
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Controller('partners')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @RequirePermission('crm', 'partners', 'create')
  create(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  @Get()
  @RequirePermission('crm', 'partners', 'read')
  findAll(@Query('companyId') companyId: string) {
    // On convertit en number et on suppose que companyId est toujours fourni
    const id = Number(companyId);
    if (Number.isNaN(id)) {
      throw new BadRequestException('companyId invalide');
    }
    return this.partnersService.findAll(id); // toujours un number
  }

  @Get(':id')
  @RequirePermission('crm', 'partners', 'read')
  findOne(@Param('id') id: string) {
    return this.partnersService.findOne(Number(id));
  }

  @Patch(':id')
  @RequirePermission('crm', 'partners', 'update')
  update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return this.partnersService.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('crm', 'partners', 'delete')
  remove(@Param('id') id: string) {
    return this.partnersService.remove(Number(id));
  }
}
