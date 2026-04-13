import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../auth/entities/user.entity';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import {
  CreateGrowthStageDto,
  CreateProductRecommendationDto,
  CreateSeasonCalendarDto,
  UpdateGrowthStageDto,
  UpdateSeasonCalendarDto,
} from '../dto/create-season-calendar.dto';
import { SeasonActivityAction } from '../entities';
import { ActivityLogService } from '../services/activity-log.service';
import { SeasonCalendarService } from '../services/season-calendar.service';

@Controller('admin/season-calendar')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCalendarController {
  constructor(
    private readonly seasonCalendarService: SeasonCalendarService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Post('calendars')
  async createCalendar(@Body() body: CreateSeasonCalendarDto, @Req() req: any) {
    const calendar = await this.seasonCalendarService.create(body);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.CREATE,
      'calendar',
      calendar.id,
      calendar.seasonName,
      { cropId: calendar.cropId, zoneId: calendar.zoneId },
    );
    return calendar;
  }

  @Patch('calendars/:id')
  async updateCalendar(
    @Param('id') id: string,
    @Body() body: UpdateSeasonCalendarDto,
    @Req() req: any,
  ) {
    const calendar = await this.seasonCalendarService.update(id, body);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.UPDATE,
      'calendar',
      calendar.id,
      calendar.seasonName,
      { cropId: calendar.cropId, zoneId: calendar.zoneId },
    );
    return calendar;
  }

  @Delete('calendars/:id')
  async deleteCalendar(@Param('id') id: string, @Req() req: any) {
    const result = await this.seasonCalendarService.delete(id);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.DELETE,
      'calendar',
      result.id,
      result.seasonName,
      { cropId: result.cropId, zoneId: result.zoneId },
    );
    return result;
  }

  @Post('calendars/:id/stages')
  async addStage(
    @Param('id') id: string,
    @Body() body: CreateGrowthStageDto,
    @Req() req: any,
  ) {
    const stage = await this.seasonCalendarService.addStage(id, body);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.CREATE,
      'stage',
      stage.id,
      stage.name,
      { seasonCalendarId: stage.seasonCalendarId },
    );
    return stage;
  }

  @Patch('stages/:id')
  async updateStage(
    @Param('id') id: string,
    @Body() body: UpdateGrowthStageDto,
    @Req() req: any,
  ) {
    const stage = await this.seasonCalendarService.updateStage(id, body);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.UPDATE,
      'stage',
      stage.id,
      stage.name,
      { seasonCalendarId: stage.seasonCalendarId },
    );
    return stage;
  }

  @Delete('stages/:id')
  async deleteStage(@Param('id') id: string, @Req() req: any) {
    const result = await this.seasonCalendarService.deleteStage(id);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.DELETE,
      'stage',
      result.id,
      result.name,
      { seasonCalendarId: result.seasonCalendarId },
    );
    return result;
  }

  @Post('stages/:stageId/recommendations')
  async addRecommendation(
    @Param('stageId') stageId: string,
    @Body() body: CreateProductRecommendationDto,
    @Req() req: any,
  ) {
    const recommendation = await this.seasonCalendarService.addRecommendation(
      stageId,
      body,
    );
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.CREATE,
      'recommendation',
      recommendation.id,
      recommendation.productId,
      { growthStageId: recommendation.growthStageId },
    );
    return recommendation;
  }

  @Delete('recommendations/:id')
  async deleteRecommendation(@Param('id') id: string, @Req() req: any) {
    const result = await this.seasonCalendarService.deleteRecommendation(id);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.DELETE,
      'recommendation',
      result.id,
      result.productId,
      { growthStageId: result.growthStageId },
    );
    return result;
  }
}
