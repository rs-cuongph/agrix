import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreSettings } from './entities/store-settings.entity';
import { StoreSettingsService } from './store-settings.service';
import { PublicSettingsController } from './public-settings.controller';
import { AdminSettingsController } from './admin-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoreSettings])],
  controllers: [PublicSettingsController, AdminSettingsController],
  providers: [StoreSettingsService],
  exports: [StoreSettingsService],
})
export class CommonModule {}
