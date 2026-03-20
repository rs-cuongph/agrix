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
import type { StockImportDto, StockAdjustDto } from './stock-import.service';

@Controller('stock')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StockController {
  constructor(private readonly stockImportService: StockImportService) {}

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  async importStock(@Body() dto: StockImportDto, @Req() req: any) {
    return this.stockImportService.importStock(dto, req.user.id);
  }

  @Post('adjust')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  async adjustStock(@Body() dto: StockAdjustDto, @Req() req: any) {
    return this.stockImportService.adjustStock(dto, req.user.id);
  }

  @Get('history')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY, UserRole.CASHIER)
  async getHistory(
    @Query('productId') productId?: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.stockImportService.getStockHistory(
      productId, type, page ? +page : 1, limit ? +limit : 20,
    );
  }

  @Get('batches')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY, UserRole.CASHIER)
  async getBatches(@Query('productId') productId: string) {
    if (!productId) {
      return { data: [] };
    }
    const data = await this.stockImportService.getAvailableBatches(productId);
    return { data };
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

  @Get('slow-moving')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  async getSlowMoving(
    @Query('days') days?: number,
    @Query('minStock') minStock?: number,
  ) {
    return this.stockImportService.getSlowMovingProducts(
      days ? +days : 30, minStock ? +minStock : 10,
    );
  }
}
