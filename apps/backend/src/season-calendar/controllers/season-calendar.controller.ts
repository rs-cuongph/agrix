import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SeasonCalendarService } from '../services/season-calendar.service';

@Controller('season-calendar/calendar')
@UseGuards(AuthGuard('jwt'))
export class SeasonCalendarController {
  constructor(private readonly seasonCalendarService: SeasonCalendarService) {}

  @Get()
  async getCalendar(
    @Query('zoneId') zoneId: string,
    @Query('month') month?: string,
    @Query('cropId') cropId?: string,
  ) {
    return this.seasonCalendarService.getCalendar(
      zoneId,
      month ? Number(month) : undefined,
      cropId,
    );
  }
}
