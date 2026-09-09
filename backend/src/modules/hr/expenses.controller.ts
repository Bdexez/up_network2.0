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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { ExpensesService } from './expenses.service';
import {
  ChangeExpenseStatusDto,
  CreateExpenseReportDto,
  ListExpenseReportsDto,
  UpdateExpenseReportDto,
} from './dto/expense.dto';

@ApiTags('hr')
@ApiBearerAuth()
@Controller('hr/expense-reports')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @RequirePermission('hr', 'expenses', 'create')
  create(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateExpenseReportDto,
  ) {
    return this.expensesService.create(companyId, userId, dto);
  }

  @Get()
  @RequirePermission('hr', 'expenses', 'read')
  findAll(
    @CompanyId() companyId: number,
    @Query() query: ListExpenseReportsDto,
  ) {
    return this.expensesService.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermission('hr', 'expenses', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.expensesService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('hr', 'expenses', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseReportDto,
  ) {
    return this.expensesService.update(companyId, id, dto);
  }

  @Patch(':id/status')
  @RequirePermission('hr', 'expenses', 'approve')
  changeStatus(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeExpenseStatusDto,
  ) {
    return this.expensesService.changeStatus(companyId, userId, id, dto.status);
  }

  @Delete(':id')
  @RequirePermission('hr', 'expenses', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.expensesService.remove(companyId, id);
  }
}
