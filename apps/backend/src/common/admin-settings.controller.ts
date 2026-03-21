import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { StoreSettingsService } from './store-settings.service';

@Controller('admin/settings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSettingsController {
  constructor(private readonly settingsService: StoreSettingsService) {}

  @Get()
  async getFullSettings() {
    return this.settingsService.getFullSettings();
  }

  @Patch()
  async updateSettings(@Body() body: any) {
    return this.settingsService.upsertSettings(body);
  }
}
