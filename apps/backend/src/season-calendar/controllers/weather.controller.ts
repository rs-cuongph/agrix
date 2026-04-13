import { Controller, Get, Query } from '@nestjs/common';
import { WeatherBaselineService } from '../services/weather-baseline.service';

@Controller('season-calendar/weather')
export class WeatherController {
  constructor(
    private readonly weatherBaselineService: WeatherBaselineService,
  ) {}

  @Get()
  async findByZone(@Query('zoneId') zoneId: string) {
    return this.weatherBaselineService.findByZone(zoneId);
  }
}
