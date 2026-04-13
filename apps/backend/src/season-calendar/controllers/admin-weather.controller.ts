import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../auth/entities/user.entity';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { CreateWeatherBaselineDto } from '../dto/create-weather-baseline.dto';
import { SeasonActivityAction } from '../entities';
import { ActivityLogService } from '../services/activity-log.service';
import { WeatherBaselineService } from '../services/weather-baseline.service';

@Controller('admin/season-calendar/weather')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminWeatherController {
  constructor(
    private readonly weatherBaselineService: WeatherBaselineService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Get()
  async findAll(@Query('zoneId') zoneId?: string) {
    return this.weatherBaselineService.findAll(zoneId);
  }

  @Post()
  async createOrUpsert(
    @Body() body: CreateWeatherBaselineDto,
    @Req() req: any,
  ) {
    const baseline = await this.weatherBaselineService.createOrUpsert(body);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.UPDATE,
      'weather',
      baseline.id,
      `Weather month ${baseline.month}`,
      { zoneId: baseline.zoneId, month: baseline.month },
    );
    return baseline;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const baseline = await this.weatherBaselineService.delete(id);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.DELETE,
      'weather',
      baseline.id,
      `Weather month ${baseline.month}`,
      { zoneId: baseline.zoneId, month: baseline.month },
    );
    return baseline;
  }
}
