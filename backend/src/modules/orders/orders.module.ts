import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { StockModule } from '../stock/stock.module';

@Module({
  // L'expédition d'une commande sort du stock.
  imports: [StockModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
