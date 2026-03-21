import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { StorageModule } from './storage/storage.module';
import { AIModule } from './ai/ai.module';
import { BlogModule } from './blog/blog.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CommonModule } from './common/common.module';
import { ContactModule } from './contact/contact.module';
import { FaqModule } from './faq/faq.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../docker/.env'],
    }),
    DatabaseModule,
    AuthModule,
    InventoryModule,
    OrdersModule,
    CustomersModule,
    StorageModule,
    AIModule,
    BlogModule,
    DashboardModule,
    CommonModule,
    ContactModule,
    FaqModule,
    TestimonialModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}

