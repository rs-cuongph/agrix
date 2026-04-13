import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { SeasonCalendarModule } from './season-calendar/season-calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../docker/.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
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
    SeasonCalendarModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
