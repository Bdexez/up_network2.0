import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  /** Sociétés accessibles au compte connecté (sélecteur de société). */
  @Get('mine')
  findMine(@CurrentUser('userId') userId: number) {
    return this.companiesService.findMine(userId);
  }

  @Get('current')
  @RequirePermission('system', 'companies', 'read')
  findActive(@CompanyId() companyId: number) {
    return this.companiesService.findActive(companyId);
  }

  @Patch('current')
  @RequirePermission('system', 'companies', 'update')
  update(@CompanyId() companyId: number, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(companyId, dto);
  }
}
