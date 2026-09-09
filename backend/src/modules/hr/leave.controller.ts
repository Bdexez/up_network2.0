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
import { LeaveService } from './leave.service';
import {
  CreateLeaveRequestDto,
  DecideLeaveDto,
  ListLeaveRequestsDto,
} from './dto/leave.dto';

@ApiTags('hr')
@ApiBearerAuth()
@Controller('hr/leave-requests')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @RequirePermission('hr', 'leave', 'create')
  create(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return this.leaveService.create(companyId, userId, dto);
  }

  @Get()
  @RequirePermission('hr', 'leave', 'read')
  findAll(
    @CompanyId() companyId: number,
    @Query() query: ListLeaveRequestsDto,
  ) {
    return this.leaveService.findAll(companyId, query);
  }

  @Get('summary')
  @RequirePermission('hr', 'leave', 'read')
  summary(@CompanyId() companyId: number) {
    return this.leaveService.summary(companyId);
  }

  @Get(':id')
  @RequirePermission('hr', 'leave', 'read')
  findOne(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.leaveService.findOne(companyId, id);
  }

  @Patch(':id/status')
  @RequirePermission('hr', 'leave', 'approve')
  decide(
    @CompanyId() companyId: number,
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DecideLeaveDto,
  ) {
    return this.leaveService.decide(companyId, userId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('hr', 'leave', 'delete')
  remove(
    @CompanyId() companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.leaveService.remove(companyId, id);
  }
}
