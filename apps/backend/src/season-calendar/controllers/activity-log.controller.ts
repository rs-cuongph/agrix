import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../auth/entities/user.entity';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { ActivityLogQueryDto } from '../dto/activity-log-query.dto';
import { ActivityLogService } from '../services/activity-log.service';

@Controller('admin/season-calendar/activity-log')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  async find(@Query() query: ActivityLogQueryDto) {
    return this.activityLogService.findPaginated(query);
  }
}
