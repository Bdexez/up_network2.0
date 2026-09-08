import { Module } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { StockModule } from '../stock/stock.module';

@Module({
  // La réception d'une commande fournisseur entre du stock.
  imports: [StockModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
