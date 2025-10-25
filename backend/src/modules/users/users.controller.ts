import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔹 Créer un utilisateur
  @Post()
  @RequirePermission('system', 'users', 'create')
  async create(
    @Body() body: { email: string; username: string; password: string },
  ) {
    return this.usersService.create(body);
  }

  // 🔹 Récupérer tous les utilisateurs
  @Get()
  @RequirePermission('system', 'users', 'read')
  async findAll() {
    return this.usersService.findAll();
  }

  // 🔹 Récupérer un utilisateur par ID
  @Get(':id')
  @RequirePermission('system', 'users', 'read')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  // 🔹 Mettre à jour un utilisateur
  @Put(':id')
  @RequirePermission('system', 'users', 'update')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      email?: string;
      username?: string;
      password?: string;
      isActive?: boolean;
    },
  ) {
    return this.usersService.update(Number(id), body);
  }

  // 🔹 Supprimer un utilisateur
  @Delete(':id')
  @RequirePermission('system', 'users', 'delete')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(Number(id));
  }
}
