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
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { MoveStageDto } from './dto/move-stage.dto';
import { ListOpportunitiesDto } from './dto/list-opportunities.dto';

@ApiTags('crm')
@ApiBearerAuth()
@Controller('crm/opportunities')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @RequirePermission('crm', 'opportunities', 'create')
  create(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.create(companyId, userId, dto);
  }

  @Get()
  @RequirePermission('crm', 'opportunities', 'read')
  findAll(
    @CompanyId() companyId: number,
    @Query() query: ListOpportunitiesDto,
  ) {
    return this.opportunitiesService.findAll(companyId, query);
  }

  @Get('pipeline')
  @RequirePermission('crm', 'opportunities', 'read')
  pipeline(@CompanyId() companyId: number) {
    return this.opportunitiesService.pipeline(companyId);
  }

  @Get(':id')
  @RequirePermission('crm', 'opportunities', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.opportunitiesService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermission('crm', 'opportunities', 'update')
  update(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.update(companyId, id, dto);
  }

  @Patch(':id/stage')
  @RequirePermission('crm', 'opportunities', 'update')
  moveStage(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MoveStageDto,
  ) {
    return this.opportunitiesService.moveStage(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('crm', 'opportunities', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.opportunitiesService.remove(companyId, id);
  }
}
