import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductUnitConversion } from './entities/product-unit-conversion.entity';
import { StockEntry } from './entities/stock-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Product,
      ProductUnitConversion,
      StockEntry,
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class InventoryModule {}
