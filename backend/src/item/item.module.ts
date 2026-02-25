import { Module } from '@nestjs/common';
import { ItemController, ItemStockController } from './item.controller';
import { ItemService } from './item.service';

@Module({
  controllers: [ItemController, ItemStockController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
