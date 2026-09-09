import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { CompanyId } from 'src/common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { PeriodDto } from './dto/period.dto';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** Balance âgée : encours client par ancienneté de retard. */
  @Get('aging')
  @RequirePermission('reports', 'accounting', 'read')
  aging(@CompanyId() companyId: number) {
    return this.reportsService.aging(companyId);
  }

  /** Factures échues non soldées, pour lancer les relances. */
  @Get('overdue')
  @RequirePermission('reports', 'accounting', 'read')
  overdue(@CompanyId() companyId: number) {
    return this.reportsService.overdueInvoices(companyId);
  }

  @Post('overdue/:id/reminder')
  @RequirePermission('sales', 'invoices', 'update')
  recordReminder(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reportsService.recordReminder(companyId, id);
  }

  /** Récapitulatif de TVA collectée et déductible. */
  @Get('vat')
  @RequirePermission('reports', 'accounting', 'read')
  vat(@CompanyId() companyId: number, @Query() period: PeriodDto) {
    return this.reportsService.vatSummary(companyId, resolvePeriod(period));
  }

  /** Export FEC de la période, au format réglementaire. */
  @Get('fec')
  @RequirePermission('reports', 'accounting', 'export')
  async fec(
    @CompanyId() companyId: number,
    @Query() period: PeriodDto,
    @Res() res: Response,
  ) {
    const range = resolvePeriod(period);
    const { content, balance } = await this.reportsService.fec(
      companyId,
      range,
    );

    // Nom de fichier réglementaire : SIREN + FEC + date de clôture.
    const fileName = `FEC_${formatCompact(range.to)}.txt`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    // Renseigné pour permettre un contrôle sans réouvrir le fichier.
    res.setHeader('X-Fec-Balanced', String(balance.balanced));
    res.send(content);
  }
}

/** Période demandée, ou l'année civile en cours par défaut. */
function resolvePeriod(period: PeriodDto) {
  const now = new Date();
  return {
    from: period.from
      ? new Date(period.from)
      : new Date(now.getFullYear(), 0, 1),
    to: period.to
      ? new Date(period.to)
      : new Date(now.getFullYear(), 11, 31, 23, 59, 59),
  };
}

function formatCompact(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}
