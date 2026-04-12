import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductUnitConversion } from './entities/product-unit-conversion.entity';
import { StockEntry } from './entities/stock-entry.entity';
import { Unit } from './entities/unit.entity';
import { InventoryService } from './inventory.service';
import { UnitConversionService } from './unit-conversion.service';
import { StockImportService } from './stock-import.service';
import { ProductsController } from './products.controller';
import { CategoriesController } from './categories.controller';
import { StockController } from './stock.controller';
import { UnitConversionController } from './unit-conversion.controller';
import { UnitsController } from './units.controller';
import { PublicProductsController } from './public-products.controller';

import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Product,
      ProductUnitConversion,
      StockEntry,
      Unit,
    ]),
    StorageModule,
  ],
  controllers: [
    ProductsController,
    PublicProductsController,
    CategoriesController,
    StockController,
    UnitConversionController,
    UnitsController,
  ],
  providers: [InventoryService, UnitConversionService, StockImportService],
  exports: [
    TypeOrmModule,
    InventoryService,
    UnitConversionService,
    StockImportService,
  ],
})
export class InventoryModule {}
