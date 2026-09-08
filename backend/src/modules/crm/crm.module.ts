import { Module } from '@nestjs/common';
import { LeadsController } from './leads/leads.controller';
import { LeadsService } from './leads/leads.service';
import { OpportunitiesController } from './opportunities/opportunities.controller';
import { OpportunitiesService } from './opportunities/opportunities.service';
import { ActivitiesController } from './activities/activities.controller';
import { ActivitiesService } from './activities/activities.service';

/** Addon CRM : pistes, pipeline d'opportunités, activités. */
@Module({
  controllers: [LeadsController, OpportunitiesController, ActivitiesController],
  providers: [LeadsService, OpportunitiesService, ActivitiesService],
  exports: [LeadsService, OpportunitiesService, ActivitiesService],
})
export class CrmModule {}
