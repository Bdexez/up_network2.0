import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { UserCompanyService } from './user-company.service';
import { AddUserDto } from './../auth/dto/add-user.dto';
import { UpdateRoleDto } from './../auth/dto/update-role.dto';

@Controller('user-company')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UserCompanyController {
  constructor(private userCompanyService: UserCompanyService) {}

  @Post()
  @RequirePermission('system', 'users', 'manage')
  addUser(@Body() dto: AddUserDto) {
    return this.userCompanyService.addUserToCompany(
      dto.userId,
      dto.companyId,
      dto.roleId,
      dto.isDefault,
    );
  }

  @Patch('role')
  @RequirePermission('system', 'users', 'manage')
  updateRole(@Body() dto: UpdateRoleDto) {
    return this.userCompanyService.updateUserRole(
      dto.userId,
      dto.companyId,
      dto.roleId,
    );
  }

  @Get('company/:companyId')
  @RequirePermission('system', 'users', 'read')
  getUsers(@Param('companyId') companyId: string) {
    return this.userCompanyService.getUsersByCompany(Number(companyId));
  }

  @Patch('default')
  @RequirePermission('system', 'users', 'manage')
  setDefault(@Body() dto: { userId: number; companyId: number }) {
    return this.userCompanyService.setDefaultCompany(dto.userId, dto.companyId);
  }
}
