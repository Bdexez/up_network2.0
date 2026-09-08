import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';
import { ContactsService } from './contacts.service';

@Module({
  controllers: [PartnersController],
  providers: [PartnersService, ContactsService],
})
export class PartnersModule {}
