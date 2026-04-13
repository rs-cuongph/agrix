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
import { CreateCropDto, UpdateCropDto } from '../dto/create-crop.dto';
import { SeasonActivityAction } from '../entities';
import { ActivityLogService } from '../services/activity-log.service';
import { CropsService } from '../services/crops.service';

@Controller('admin/season-calendar/crops')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCropsController {
  constructor(
    private readonly cropsService: CropsService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Post()
  async create(@Body() body: CreateCropDto, @Req() req: any) {
    const crop = await this.cropsService.create(body);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.CREATE,
      'crop',
      crop.id,
      crop.name,
    );
    return crop;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCropDto,
    @Req() req: any,
  ) {
    const crop = await this.cropsService.update(id, body);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.UPDATE,
      'crop',
      crop.id,
      crop.name,
    );
    return crop;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const crop = await this.cropsService.softDelete(id);
    await this.activityLogService.log(
      req.user.id,
      req.user.username,
      SeasonActivityAction.DELETE,
      'crop',
      crop.id,
      crop.name,
    );
    return crop;
  }
}
