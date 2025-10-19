import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';

@Controller('companies')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Post()
  @RequirePermission('system', 'companies', 'create')
  create(@Body() body: { name: string; code: string }) {
    return this.companiesService.create(body.name, body.code);
  }

  @Get()
  @RequirePermission('system', 'companies', 'read')
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @RequirePermission('system', 'companies', 'read')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(Number(id));
  }
}
