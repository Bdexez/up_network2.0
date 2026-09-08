import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      service: 'up-network-erp-api',
      timestamp: new Date().toISOString(),
    };
  }
}
