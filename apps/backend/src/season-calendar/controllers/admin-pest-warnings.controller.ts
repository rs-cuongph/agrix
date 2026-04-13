import {
  Body,
  Controller,
  Delete,
  Get,
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
  CreatePestWarningDto,
  UpdatePestWarningDto,
} from '../dto/create-pest-warning.dto';
import { SeasonActivityAction } from '../entities';
import { ActivityLogService } from '../services/activity-log.service';
import { PestWarningService } from '../services/pest-warning.service';

@Controller('admin/season-calendar')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPestWarningsController {
  constructor(
    private readonly pestWarningService: PestWarningService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Get('stages/:stageId/pest-warnings')
  async findByStage(@Param('stageId') stageId: string) {
    return this.pestWarningService.findByStageId(stageId);
  }

  @Post('stages/:stageId/pest-warnings')
  async create(
    @Param('stageId') stageId: string,
    @Body() body: CreatePestWarningDto,
    @Req() req: any,
  ) {
    const warning = await this.pestWarningService.create(stageId, body);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.CREATE,
      'pest_warning',
      warning.id,
      warning.name,
      { growthStageId: stageId },
    );
    return warning;
  }

  @Patch('pest-warnings/:id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePestWarningDto,
    @Req() req: any,
  ) {
    const warning = await this.pestWarningService.update(id, body);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.UPDATE,
      'pest_warning',
      warning.id,
      warning.name,
      { growthStageId: warning.growthStageId },
    );
    return warning;
  }

  @Delete('pest-warnings/:id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const result = await this.pestWarningService.delete(id);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.DELETE,
      'pest_warning',
      result.id,
      result.name,
      { growthStageId: result.growthStageId },
    );
    return result;
  }
}
