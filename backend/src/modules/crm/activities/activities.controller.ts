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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ListActivitiesDto } from './dto/list-activities.dto';

@ApiTags('crm')
@ApiBearerAuth()
@Controller('crm/activities')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @RequirePermission('crm', 'activities', 'create')
  create(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateActivityDto,
  ) {
    return this.activitiesService.create(companyId, userId, dto);
  }

  @Get()
  @RequirePermission('crm', 'activities', 'read')
  findAll(@CompanyId() companyId: number, @Query() query: ListActivitiesDto) {
    return this.activitiesService.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermission('crm', 'activities', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.activitiesService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('crm', 'activities', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(companyId, id, dto);
  }

  @Patch(':id/toggle')
  @RequirePermission('crm', 'activities', 'update')
  toggleDone(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.activitiesService.toggleDone(companyId, id);
  }

  @Delete(':id')
  @RequirePermission('crm', 'activities', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.activitiesService.remove(companyId, id);
  }
}
