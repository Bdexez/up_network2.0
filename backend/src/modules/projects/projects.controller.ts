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
import { ProjectsService } from './projects.service';
import {
  ChangeProjectStatusDto,
  CreateProjectDto,
  CreateTaskDto,
  CreateTimeEntryDto,
  ListProjectsDto,
  UpdateProjectDto,
  UpdateTaskDto,
} from './dto/project.dto';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // --- Projets --------------------------------------------------------------

  @Post()
  @RequirePermission('projects', 'projects', 'create')
  create(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(companyId, userId, dto);
  }

  @Get()
  @RequirePermission('projects', 'projects', 'read')
  findAll(@CompanyId() companyId: number, @Query() query: ListProjectsDto) {
    return this.projectsService.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermission('projects', 'projects', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('projects', 'projects', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(companyId, id, dto);
  }

  @Patch(':id/status')
  @RequirePermission('projects', 'projects', 'update')
  changeStatus(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeProjectStatusDto,
  ) {
    return this.projectsService.changeStatus(companyId, id, dto.status);
  }

  @Delete(':id')
  @RequirePermission('projects', 'projects', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.remove(companyId, id);
  }

  // --- Tâches ---------------------------------------------------------------

  @Post(':id/tasks')
  @RequirePermission('projects', 'tasks', 'create')
  createTask(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTaskDto,
  ) {
    return this.projectsService.createTask(companyId, id, dto);
  }

  @Patch(':id/tasks/:taskId')
  @RequirePermission('projects', 'tasks', 'update')
  updateTask(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.projectsService.updateTask(companyId, id, taskId, dto);
  }

  @Delete(':id/tasks/:taskId')
  @RequirePermission('projects', 'tasks', 'delete')
  removeTask(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.projectsService.removeTask(companyId, id, taskId);
  }

  // --- Temps passé ----------------------------------------------------------

  @Post(':id/time')
  @RequirePermission('projects', 'time', 'create')
  logTime(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTimeEntryDto,
  ) {
    return this.projectsService.logTime(companyId, userId, id, dto);
  }

  @Delete(':id/time/:entryId')
  @RequirePermission('projects', 'time', 'delete')
  removeTime(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('entryId', ParseIntPipe) entryId: number,
  ) {
    return this.projectsService.removeTime(companyId, id, entryId);
  }
}
