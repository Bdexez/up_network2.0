import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateOpportunityDto } from './create-opportunity.dto';

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {
  /** Renseigné quand on bascule l'opportunité en LOST. */
  @IsOptional()
  @IsString()
  lostReason?: string;
}
