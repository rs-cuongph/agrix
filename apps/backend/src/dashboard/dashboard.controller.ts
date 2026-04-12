import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../inventory/entities/product.entity';
import { AdvancedReportingService } from './advanced-reporting.service';
import {
  ExportReportDto,
  RankingQueryDto,
  ReportingFilterDto,
  TopCustomersQueryDto,
} from './dto/reporting-filter.dto';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly advancedReportingService: AdvancedReportingService,
  ) {}

  @Get('revenue')
  async getRevenue(@Query() filter: ReportingFilterDto) {
    return this.advancedReportingService.getLegacyRevenueSummary(filter);
  }

  @Get('revenue-series')
  async getRevenueSeries(@Query() filter: ReportingFilterDto) {
    return this.advancedReportingService.getRevenueSeries(filter);
  }

  @Get('top-products')
  async getTopProducts(@Query() query: RankingQueryDto) {
    return this.advancedReportingService.getTopProducts(query);
  }

  @Get('gross-profit-by-category')
  async getGrossProfitByCategory(@Query() filter: ReportingFilterDto) {
    return this.advancedReportingService.getGrossProfitByCategory(filter);
  }

  @Get('top-customers')
  async getTopCustomers(@Query() query: TopCustomersQueryDto) {
    return this.advancedReportingService.getTopCustomers(query);
  }

  @Get('alerts')
  async getAlerts() {
    // Low stock products (below 10 units)
    const lowStock = await this.productRepo
      .createQueryBuilder('product')
      .where('product.currentStockBase < :threshold', { threshold: 10 })
      .andWhere('product.isActive = true')
      .orderBy('product.currentStockBase', 'ASC')
      .take(10)
      .getMany();

    return {
      lowStock: lowStock.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        currentStock: p.currentStockBase,
        baseUnit: p.baseUnit,
      })),
    };
  }

  @Post('exports')
  async exportReport(@Body() dto: ExportReportDto) {
    return this.advancedReportingService.getReportExport(dto);
  }
}
