import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { StockImportService } from './stock-import.service';
import type { StockImportDto } from './stock-import.service';

@Controller('stock')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StockController {
  constructor(private readonly stockImportService: StockImportService) {}

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  async importStock(@Body() dto: StockImportDto, @Req() req: any) {
    return this.stockImportService.importStock(dto, req.user.id);
  }

  @Get('alerts')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY, UserRole.CASHIER)
  async getAlerts(@Query('days') days?: number) {
    const [lowStock, expiring] = await Promise.all([
      this.stockImportService.getLowStockAlerts(),
      this.stockImportService.getExpiringProducts(days ? +days : 30),
    ]);

    return {
      lowStock,
      expiring,
      summary: {
        lowStockCount: lowStock.length,
        expiringCount: expiring.length,
      },
    };
  }
}
