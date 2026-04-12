import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SyncController } from './sync.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { Customer } from '../customers/entities/customer.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Order, OrderItem, Customer]),
    InventoryModule,
  ],
  controllers: [OrdersController, SyncController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrdersModule {}
