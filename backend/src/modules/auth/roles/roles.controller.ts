import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { CompanyId } from 'src/common/decorators/current-user.decorator';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  @RequirePermission('system', 'roles', 'read')
  listPermissions() {
    return this.rolesService.listPermissions();
  }

  @Post()
  @RequirePermission('system', 'roles', 'create')
  create(@CompanyId() companyId: number, @Body() dto: CreateRoleDto) {
    return this.rolesService.create(companyId, dto);
  }

  @Get()
  @RequirePermission('system', 'roles', 'read')
  findAll(@CompanyId() companyId: number) {
    return this.rolesService.findAll(companyId);
  }

  @Get(':id')
  @RequirePermission('system', 'roles', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.rolesService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('system', 'roles', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('system', 'roles', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.rolesService.remove(companyId, id);
  }
}
