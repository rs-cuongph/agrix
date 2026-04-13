import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZonesService } from '../services/zones.service';

@Controller('season-calendar/zones')
@UseGuards(AuthGuard('jwt'))
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    return this.zonesService.findAll(activeOnly !== 'false');
  }
}
