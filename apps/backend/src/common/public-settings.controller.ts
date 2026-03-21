import { Controller, Get } from '@nestjs/common';
import { StoreSettingsService } from './store-settings.service';

@Controller('public/settings')
export class PublicSettingsController {
  constructor(private readonly settingsService: StoreSettingsService) {}

  @Get()
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }
}
