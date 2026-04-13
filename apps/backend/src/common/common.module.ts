import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreSettings } from './entities/store-settings.entity';
import { StoreSettingsService } from './store-settings.service';
import { PublicSettingsController } from './public-settings.controller';
import { AdminSettingsController } from './admin-settings.controller';
import { ServiceLoggerService } from './service-logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([StoreSettings])],
  controllers: [PublicSettingsController, AdminSettingsController],
  providers: [StoreSettingsService, ServiceLoggerService],
  exports: [StoreSettingsService, ServiceLoggerService],
})
export class CommonModule {}
