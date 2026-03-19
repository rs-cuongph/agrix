import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../inventory/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
  ) {}

  @Get('revenue')
  async getRevenue() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.orderRepo
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.totalAmount), 0)', 'totalRevenue')
      .addSelect('COUNT(order.id)', 'orderCount')
      .where('order.createdAt >= :today', { today })
      .getRawOne();

    const totalProducts = await this.productRepo.count({ where: { isActive: true } });
    const totalCustomers = await this.customerRepo.count();

    return {
      revenueToday: parseInt(result?.totalRevenue || '0', 10),
      orderCountToday: parseInt(result?.orderCount || '0', 10),
      totalProducts,
      totalCustomers,
    };
  }

  @Get('top-products')
  async getTopProducts() {
    const results = await this.orderRepo.manager.query(`
      SELECT p.name, p.sku, COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    return results.map((r: any) => ({
      name: r.name,
      sku: r.sku,
      totalSold: parseInt(r.total_sold, 10),
    }));
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
}
