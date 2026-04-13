import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SeasonSuggestionService } from '../services/season-suggestion.service';

@Controller('season-calendar/suggest')
@UseGuards(AuthGuard('jwt'))
export class SeasonSuggestionController {
  constructor(
    private readonly seasonSuggestionService: SeasonSuggestionService,
  ) {}

  @Get()
  async getSuggestions(
    @Query('zoneId') zoneId: string,
    @Query('month') month: string,
    @Query('cropId') cropId: string,
    @Query('stageId') stageId?: string,
  ) {
    return this.seasonSuggestionService.getSuggestions(
      zoneId,
      Number(month),
      cropId,
      stageId,
    );
  }
}
