import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../inventory/entities/product.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import {
  ExportReportDto,
  RankingQueryDto,
  ReportingFilterDto,
  ReportingGranularity,
  TopCustomersQueryDto,
} from './dto/reporting-filter.dto';
import {
  addBucket,
  formatBucketLabel,
  getBucketEnd,
  getBucketSql,
  normalizeReportingFilter,
  toSerializableFilter,
} from './reporting-range.util';
import { rankRows, toNumber } from './reporting-response.util';

type RevenueSeriesPoint = {
  bucketLabel: string;
  bucketStart: string;
  bucketEnd: string;
  revenue: number;
  orderCount: number;
};

type RankedTopProduct = {
  productId: string;
  sku: string;
  productName: string;
  categoryName: string | null;
  quantitySold: number;
  revenueContribution: number;
};

type RankedPurchaseCustomer = {
  customerId: string;
  customerName: string;
  phone: string | null;
  orderCount: number;
  totalPurchaseAmount: number;
};

type RankedDebtCustomer = {
  customerId: string;
  customerName: string;
  phone: string | null;
  outstandingDebt: number;
  lastDebtActivityAt: string | null;
};

type RevenueRow = {
  bucket_start: string;
  revenue: string;
  order_count: string;
};

type RevenueTotalsRow = {
  total_revenue: string;
  total_orders: string;
};

type TopProductRow = {
  product_id: string;
  sku: string;
  product_name: string;
  category_name: string | null;
  quantity_sold: string;
  revenue_contribution: string;
};

type GrossProfitRow = {
  category_id: string | null;
  category_name: string;
  revenue: string;
  cost_of_goods_sold: string;
  missing_cost_order_count: string;
};

type PurchaseCustomerRow = {
  customer_id: string;
  customer_name: string;
  phone: string | null;
  order_count: string;
  total_purchase_amount: string;
};

type DebtCustomerRow = {
  customer_id: string;
  customer_name: string;
  phone: string | null;
  outstanding_debt: string;
};

@Injectable()
export class AdvancedReportingService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly dataSource: DataSource,
  ) {}

  private async queryRows<T>(query: string, params: unknown[]): Promise<T[]> {
    return this.dataSource.query<T>(query, params);
  }

  async getRevenueSeries(filterDto?: ReportingFilterDto) {
    const filter = normalizeReportingFilter(filterDto);
    const bucketSql = getBucketSql(filter.granularity);

    const [seriesRows, totals, totalProducts, totalCustomers] =
      await Promise.all([
        this.queryRows<RevenueRow>(
          `
          SELECT
            ${bucketSql} AS bucket_start,
            COALESCE(SUM(o.total_amount), 0) AS revenue,
            COUNT(o.id) AS order_count
          FROM orders o
          WHERE o.status = $1
            AND o.created_at >= $2
            AND o.created_at <= $3
          GROUP BY bucket_start
          ORDER BY bucket_start ASC
        `,
          [
            OrderStatus.COMPLETED,
            filter.from.toISOString(),
            filter.to.toISOString(),
          ],
        ),
        this.queryRows<RevenueTotalsRow>(
          `
          SELECT
            COALESCE(SUM(o.total_amount), 0) AS total_revenue,
            COUNT(o.id) AS total_orders
          FROM orders o
          WHERE o.status = $1
            AND o.created_at >= $2
            AND o.created_at <= $3
        `,
          [
            OrderStatus.COMPLETED,
            filter.from.toISOString(),
            filter.to.toISOString(),
          ],
        ),
        this.productRepo.count({ where: { isActive: true } }),
        this.customerRepo.count(),
      ]);

    const rowMap = new Map<string, RevenueRow>(
      seriesRows.map((row) => [new Date(row.bucket_start).toISOString(), row]),
    );

    const series: RevenueSeriesPoint[] = [];
    let cursor = new Date(filter.from);
    while (cursor <= filter.to) {
      const bucketStart = new Date(cursor);
      const bucketEnd = getBucketEnd(bucketStart, filter.granularity);
      const key = bucketStart.toISOString();
      const row = rowMap.get(key);
      series.push({
        bucketLabel: formatBucketLabel(bucketStart, filter.granularity),
        bucketStart: bucketStart.toISOString(),
        bucketEnd: bucketEnd.toISOString(),
        revenue: toNumber(row?.revenue),
        orderCount: toNumber(row?.order_count),
      });
      cursor = addBucket(bucketStart, filter.granularity);
    }

    const summaryRow: RevenueTotalsRow = totals[0] ?? {
      total_revenue: '0',
      total_orders: '0',
    };

    return {
      filter: toSerializableFilter(filter),
      summary: {
        totalRevenue: toNumber(summaryRow.total_revenue),
        totalOrders: toNumber(summaryRow.total_orders),
        totalProducts,
        totalCustomers,
      },
      series,
    };
  }

  async getTopProducts(query?: RankingQueryDto) {
    const filter = normalizeReportingFilter(query);
    const limit = query?.limit ?? 10;
    const rows = await this.queryRows<TopProductRow>(
      `
        SELECT
          p.id AS product_id,
          p.sku AS sku,
          p.name AS product_name,
          c.name AS category_name,
          COALESCE(SUM(oi.quantity_base), 0) AS quantity_sold,
          COALESCE(SUM(oi.line_total), 0) AS revenue_contribution
        FROM orders o
        INNER JOIN order_items oi ON oi.order_id = o.id
        INNER JOIN products p ON p.id = oi.product_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE o.status = $1
          AND o.created_at >= $2
          AND o.created_at <= $3
        GROUP BY p.id, p.sku, p.name, c.name
        ORDER BY quantity_sold DESC, revenue_contribution DESC, p.name ASC
        LIMIT $4
      `,
      [
        OrderStatus.COMPLETED,
        filter.from.toISOString(),
        filter.to.toISOString(),
        limit,
      ],
    );

    return {
      filter: toSerializableFilter(filter),
      items: rankRows<RankedTopProduct>(
        rows.map((row) => ({
          productId: row.product_id,
          sku: row.sku,
          productName: row.product_name,
          categoryName: row.category_name ?? null,
          quantitySold: toNumber(row.quantity_sold),
          revenueContribution: toNumber(row.revenue_contribution),
        })),
        (row) => row.quantitySold,
      ),
    };
  }

  async getGrossProfitByCategory(filterDto?: ReportingFilterDto) {
    const filter = normalizeReportingFilter(filterDto);

    const rows = await this.queryRows<GrossProfitRow>(
      `
        WITH revenue_by_category AS (
          SELECT
            p.category_id AS category_id,
            COALESCE(c.name, 'Chưa phân loại') AS category_name,
            COALESCE(SUM(oi.line_total), 0) AS revenue
          FROM orders o
          INNER JOIN order_items oi ON oi.order_id = o.id
          INNER JOIN products p ON p.id = oi.product_id
          LEFT JOIN categories c ON c.id = p.category_id
          WHERE o.status = $1
            AND o.created_at >= $2
            AND o.created_at <= $3
          GROUP BY p.category_id, c.name
        ),
        cost_by_category AS (
          SELECT
            p.category_id AS category_id,
            COALESCE(c.name, 'Chưa phân loại') AS category_name,
            COALESCE(SUM(ABS(se.quantity_base) * COALESCE(se.cost_price_per_unit, 0)), 0) AS cost_of_goods_sold,
            COALESCE(SUM(CASE WHEN se.cost_price_per_unit IS NULL THEN 1 ELSE 0 END), 0) AS missing_cost_order_count
          FROM orders o
          INNER JOIN stock_entries se
            ON se.reference_id = o.id
            AND se.type = 'SALE'
          INNER JOIN products p ON p.id = se.product_id
          LEFT JOIN categories c ON c.id = p.category_id
          WHERE o.status = $1
            AND o.created_at >= $2
            AND o.created_at <= $3
          GROUP BY p.category_id, c.name
        )
        SELECT
          COALESCE(r.category_id, c.category_id) AS category_id,
          COALESCE(r.category_name, c.category_name, 'Chưa phân loại') AS category_name,
          COALESCE(r.revenue, 0) AS revenue,
          COALESCE(c.cost_of_goods_sold, 0) AS cost_of_goods_sold,
          COALESCE(c.missing_cost_order_count, 0) AS missing_cost_order_count
        FROM revenue_by_category r
        FULL OUTER JOIN cost_by_category c
          ON c.category_id = r.category_id
        ORDER BY revenue DESC, category_name ASC
      `,
      [
        OrderStatus.COMPLETED,
        filter.from.toISOString(),
        filter.to.toISOString(),
      ],
    );

    return {
      filter: toSerializableFilter(filter),
      items: rows.map((row) => {
        const revenue = toNumber(row.revenue);
        const costOfGoodsSold = toNumber(row.cost_of_goods_sold);
        const missingCostOrderCount = toNumber(row.missing_cost_order_count);

        return {
          categoryId: row.category_id ?? null,
          categoryName: row.category_name,
          revenue,
          costOfGoodsSold,
          grossProfit: revenue - costOfGoodsSold,
          hasIncompleteCostData: missingCostOrderCount > 0,
          missingCostOrderCount,
        };
      }),
    };
  }

  async getTopCustomers(query?: TopCustomersQueryDto) {
    const filter = normalizeReportingFilter(query);
    const purchaseLimit = query?.purchaseLimit ?? 10;
    const debtLimit = query?.debtLimit ?? 10;

    const [purchaseRows, debtRows] = await Promise.all([
      this.queryRows<PurchaseCustomerRow>(
        `
          SELECT
            c.id AS customer_id,
            c.name AS customer_name,
            c.phone AS phone,
            COUNT(o.id) AS order_count,
            COALESCE(SUM(o.total_amount), 0) AS total_purchase_amount
          FROM orders o
          INNER JOIN customers c ON c.id = o.customer_id
          WHERE o.status = $1
            AND o.customer_id IS NOT NULL
            AND o.created_at >= $2
            AND o.created_at <= $3
          GROUP BY c.id, c.name, c.phone
          ORDER BY total_purchase_amount DESC, order_count DESC, c.name ASC
          LIMIT $4
        `,
        [
          OrderStatus.COMPLETED,
          filter.from.toISOString(),
          filter.to.toISOString(),
          purchaseLimit,
        ],
      ),
      this.queryRows<DebtCustomerRow>(
        `
          SELECT
            c.id AS customer_id,
            c.name AS customer_name,
            c.phone AS phone,
            c.outstanding_debt AS outstanding_debt
          FROM customers c
          WHERE c.outstanding_debt > 0
          ORDER BY c.outstanding_debt DESC, c.name ASC
          LIMIT $1
        `,
        [debtLimit],
      ),
    ]);

    return {
      filter: toSerializableFilter(filter),
      topByPurchase: rankRows<RankedPurchaseCustomer>(
        purchaseRows.map((row) => ({
          customerId: row.customer_id,
          customerName: row.customer_name,
          phone: row.phone ?? null,
          orderCount: toNumber(row.order_count),
          totalPurchaseAmount: toNumber(row.total_purchase_amount),
        })),
        (row) => row.totalPurchaseAmount,
      ),
      topByDebt: rankRows<RankedDebtCustomer>(
        debtRows.map((row) => ({
          customerId: row.customer_id,
          customerName: row.customer_name,
          phone: row.phone ?? null,
          outstandingDebt: toNumber(row.outstanding_debt),
          lastDebtActivityAt: null,
        })),
        (row) => row.outstandingDebt,
      ),
    };
  }

  async getReportExport(dto: ExportReportDto) {
    const filter = normalizeReportingFilter(dto.filter);
    const requestFilter = {
      granularity: filter.granularity,
      from: filter.from.toISOString(),
      to: filter.to.toISOString(),
    };

    const [revenue, topProducts, grossProfitByCategory, topCustomers] =
      await Promise.all([
        this.getRevenueSeries(requestFilter),
        this.getTopProducts({ ...requestFilter, limit: 10 }),
        this.getGrossProfitByCategory(requestFilter),
        this.getTopCustomers({
          ...requestFilter,
          purchaseLimit: 10,
          debtLimit: 10,
        }),
      ]);

    const generatedAt = new Date().toISOString();
    const fileName = `bao-cao-${filter.granularity}-${generatedAt.slice(0, 10)}.${dto.format === 'pdf' ? 'pdf' : 'xls'}`;

    return {
      format: dto.format,
      fileName,
      mimeType:
        dto.format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel',
      generatedAt,
      report: {
        filter: revenue.filter,
        summary: revenue.summary,
        revenueSeries: revenue.series,
        topProducts: topProducts.items,
        grossProfitByCategory: grossProfitByCategory.items,
        topCustomersByPurchase: topCustomers.topByPurchase,
        topCustomersByDebt: topCustomers.topByDebt,
      },
    };
  }

  async getLegacyRevenueSummary(filterDto?: ReportingFilterDto) {
    const revenue = await this.getRevenueSeries(filterDto);
    return {
      filter: revenue.filter,
      totalRevenue: revenue.summary.totalRevenue,
      totalOrders: revenue.summary.totalOrders,
      totalProducts: revenue.summary.totalProducts,
      totalCustomers: revenue.summary.totalCustomers,
      rangeLabel:
        filterDto?.granularity === ReportingGranularity.DAY ||
        !filterDto?.granularity
          ? 'Hôm nay'
          : 'Kỳ đã chọn',
    };
  }
}
