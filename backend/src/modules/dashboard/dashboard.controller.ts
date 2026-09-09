import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { CompanyId } from 'src/common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('system')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @RequirePermission('dashboard', 'stats', 'read')
  overview(@CompanyId() companyId: number) {
    return this.dashboardService.overview(companyId);
  }

  @Get('revenue')
  @RequirePermission('dashboard', 'stats', 'read')
  revenue(@CompanyId() companyId: number, @Query('months') months?: string) {
    const parsed = Number(months);
    const window =
      Number.isInteger(parsed) && parsed > 0 && parsed <= 24 ? parsed : 6;
    return this.dashboardService.revenueByMonth(companyId, window);
  }

  @Get('top-partners')
  @RequirePermission('dashboard', 'stats', 'read')
  topPartners(@CompanyId() companyId: number) {
    return this.dashboardService.topPartners(companyId);
  }

  @Get('recent')
  @RequirePermission('dashboard', 'stats', 'read')
  recent(@CompanyId() companyId: number) {
    return this.dashboardService.recentActivity(companyId);
  }
}
