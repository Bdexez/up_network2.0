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
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermission('system', 'users', 'create')
  create(@CompanyId() companyId: number, @Body() dto: CreateUserDto) {
    return this.usersService.create(companyId, dto);
  }

  @Get()
  @RequirePermission('system', 'users', 'read')
  findAll(@CompanyId() companyId: number) {
    return this.usersService.findAll(companyId);
  }

  @Get(':id')
  @RequirePermission('system', 'users', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('system', 'users', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('system', 'users', 'delete')
  remove(
    @CompanyId() companyId: number,
    @CurrentUser('userId') currentUserId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.remove(companyId, currentUserId, id);
  }
}
