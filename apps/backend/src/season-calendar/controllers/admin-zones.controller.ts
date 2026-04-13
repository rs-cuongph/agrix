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
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../auth/entities/user.entity';
import { CreateZoneDto, UpdateZoneDto } from '../dto/create-zone.dto';
import { SeasonActivityAction } from '../entities';
import { ActivityLogService } from '../services/activity-log.service';
import { ZonesService } from '../services/zones.service';

@Controller('admin/season-calendar/zones')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminZonesController {
  constructor(
    private readonly zonesService: ZonesService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Post()
  async create(@Body() body: CreateZoneDto, @Req() req: any) {
    const zone = await this.zonesService.create(body);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.CREATE,
      'zone',
      zone.id,
      zone.name,
    );
    return zone;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateZoneDto,
    @Req() req: any,
  ) {
    const zone = await this.zonesService.update(id, body);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.UPDATE,
      'zone',
      zone.id,
      zone.name,
    );
    return zone;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const zone = await this.zonesService.softDelete(id);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.DELETE,
      'zone',
      zone.id,
      zone.name,
    );
    return zone;
  }
}
