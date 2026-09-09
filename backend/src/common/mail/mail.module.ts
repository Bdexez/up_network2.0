import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

/** Global : la facturation et les relances l'utilisent toutes deux. */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
