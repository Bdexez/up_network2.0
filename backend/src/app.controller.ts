import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Sonde de disponibilité, aussi utilisée par le front au démarrage. */
  @Get('health')
  health() {
    return this.appService.health();
  }
}
