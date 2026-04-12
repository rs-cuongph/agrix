import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../inventory/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';
import { AdvancedReportingService } from './advanced-reporting.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Customer])],
  controllers: [DashboardController],
  providers: [AdvancedReportingService],
})
export class DashboardModule {}
