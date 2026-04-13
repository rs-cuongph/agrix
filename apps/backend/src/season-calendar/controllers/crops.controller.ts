import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CropsService } from '../services/crops.service';

@Controller('season-calendar/crops')
@UseGuards(AuthGuard('jwt'))
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Get()
  async findAll(@Query('zoneId') zoneId?: string) {
    return this.cropsService.findAll(zoneId);
  }
}
