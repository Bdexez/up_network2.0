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
import { EmployeesService } from './employees.service';
import {
  CreateEmployeeDto,
  ListEmployeesDto,
  UpdateEmployeeDto,
} from './dto/employee.dto';

@ApiTags('hr')
@ApiBearerAuth()
@Controller('hr/employees')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @RequirePermission('hr', 'employees', 'create')
  create(@CompanyId() companyId: number, @Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(companyId, dto);
  }

  @Get()
  @RequirePermission('hr', 'employees', 'read')
  findAll(@CompanyId() companyId: number, @Query() query: ListEmployeesDto) {
    return this.employeesService.findAll(companyId, query);
  }

  @Get('options')
  @RequirePermission('hr', 'employees', 'read')
  options(@CompanyId() companyId: number) {
    return this.employeesService.options(companyId);
  }

  /**
   * Fiche de l'utilisateur connecté. Sans permission : chacun peut consulter
   * la sienne, c'est ce qui permet de poser ses congés sans accès RH.
   */
  @Get('me')
  me(@CompanyId() companyId: number, @CurrentUser('userId') userId: number) {
    return this.employeesService.findByUser(companyId, userId);
  }

  @Get(':id')
  @RequirePermission('hr', 'employees', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.employeesService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('hr', 'employees', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('hr', 'employees', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.employeesService.remove(companyId, id);
  }
}
