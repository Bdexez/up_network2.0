import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { WarehousesService } from './warehouses.service';

@Module({
  controllers: [StockController],
  providers: [StockService, WarehousesService],
  // StockService est utilisé par les commandes (expédition) et les achats
  // (réception), qui l'appellent dans leur propre transaction.
  exports: [StockService],
})
export class StockModule {}
