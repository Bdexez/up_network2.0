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
import { ActivityStatus, ActivityType } from '@prisma/client';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/permissions.decorator';
import {
  CompanyId,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

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
  findAll(
    @CompanyId() companyId: number,
    @Query('status') status?: ActivityStatus,
    @Query('type') type?: ActivityType,
    @Query('leadId') leadId?: string,
    @Query('opportunityId') opportunityId?: string,
    @Query('partnerId') partnerId?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.activitiesService.findAll(companyId, {
      status,
      type,
      leadId: toId(leadId),
      opportunityId: toId(opportunityId),
      partnerId: toId(partnerId),
      upcoming: upcoming === 'true',
    });
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

function toId(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}
