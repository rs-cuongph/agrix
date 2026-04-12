import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import { AdvancedReportingService } from './advanced-reporting.service';
import { ReportingGranularity } from './dto/reporting-filter.dto';

describe('AdvancedReportingService', () => {
  let queryMock: jest.Mock;
  let productRepo: Pick<Repository<any>, 'count'>;
  let customerRepo: Pick<Repository<any>, 'count'>;
  let service: AdvancedReportingService;

  beforeEach(() => {
    queryMock = jest.fn();
    productRepo = { count: jest.fn().mockResolvedValue(12) };
    customerRepo = { count: jest.fn().mockResolvedValue(7) };

    service = new AdvancedReportingService(
      {} as Repository<any>,
      productRepo as Repository<any>,
      customerRepo as Repository<any>,
      { query: queryMock } as unknown as DataSource,
    );
  });

  it('builds a filled revenue series including empty buckets', async () => {
    queryMock
      .mockResolvedValueOnce([
        {
          bucket_start: '2026-04-01T00:00:00.000Z',
          revenue: '100000',
          order_count: '2',
        },
      ])
      .mockResolvedValueOnce([{ total_revenue: '100000', total_orders: '2' }]);

    const result = await service.getRevenueSeries({
      granularity: ReportingGranularity.DAY,
      from: '2026-04-01T00:00:00.000Z',
      to: '2026-04-02T23:59:59.999Z',
    });

    expect(result.summary).toEqual({
      totalRevenue: 100000,
      totalOrders: 2,
      totalProducts: 12,
      totalCustomers: 7,
    });
    expect(result.series).toHaveLength(3);
    expect(result.series[0]).toMatchObject({
      bucketLabel: '01/04/2026',
      revenue: 0,
      orderCount: 0,
    });
    expect(result.series[1]).toMatchObject({
      bucketLabel: '02/04/2026',
      revenue: 0,
      orderCount: 0,
    });
    expect(result.series[2]).toMatchObject({
      bucketLabel: '03/04/2026',
      revenue: 0,
      orderCount: 0,
    });
  });

  it('maps returned buckets directly from database timestamps', async () => {
    queryMock
      .mockResolvedValueOnce([
        {
          bucket_start: '2026-03-31T17:00:00.000Z',
          revenue: '100000',
          order_count: '2',
        },
      ])
      .mockResolvedValueOnce([{ total_revenue: '100000', total_orders: '2' }]);

    const result = await service.getRevenueSeries({
      granularity: ReportingGranularity.DAY,
      from: '2026-04-01T00:00:00.000Z',
      to: '2026-04-01T23:59:59.999Z',
    });

    expect(result.series[0]).toMatchObject({
      bucketLabel: '01/04/2026',
      revenue: 100000,
      orderCount: 2,
    });
  });

  it('ranks top products with stable ties', async () => {
    queryMock.mockResolvedValueOnce([
      {
        product_id: 'p-1',
        sku: 'SKU-1',
        product_name: 'Alpha',
        category_name: 'Hat giong',
        quantity_sold: '10',
        revenue_contribution: '200000',
      },
      {
        product_id: 'p-2',
        sku: 'SKU-2',
        product_name: 'Beta',
        category_name: 'Hat giong',
        quantity_sold: '10',
        revenue_contribution: '150000',
      },
    ]);

    const result = await service.getTopProducts({
      granularity: ReportingGranularity.DAY,
      from: '2026-04-01T00:00:00.000Z',
      to: '2026-04-01T23:59:59.999Z',
      limit: 10,
    });

    expect(result.items).toEqual([
      expect.objectContaining({ rank: 1, productId: 'p-1', quantitySold: 10 }),
      expect.objectContaining({ rank: 1, productId: 'p-2', quantitySold: 10 }),
    ]);
  });

  it('marks incomplete cost data in gross profit records', async () => {
    queryMock.mockResolvedValueOnce([
      {
        category_id: 'c-1',
        category_name: 'Phan bon',
        revenue: '300000',
        cost_of_goods_sold: '120000',
        missing_cost_order_count: '2',
      },
    ]);

    const result = await service.getGrossProfitByCategory({
      granularity: ReportingGranularity.MONTH,
      from: '2026-04-01T00:00:00.000Z',
      to: '2026-04-30T23:59:59.999Z',
    });

    expect(result.items[0]).toEqual({
      categoryId: 'c-1',
      categoryName: 'Phan bon',
      revenue: 300000,
      costOfGoodsSold: 120000,
      grossProfit: 180000,
      hasIncompleteCostData: true,
      missingCostOrderCount: 2,
    });
  });

  it('returns purchase and debt rankings separately', async () => {
    queryMock
      .mockResolvedValueOnce([
        {
          customer_id: 'cus-1',
          customer_name: 'Nguyen Van A',
          phone: '0901',
          order_count: '3',
          total_purchase_amount: '500000',
        },
      ])
      .mockResolvedValueOnce([
        {
          customer_id: 'cus-2',
          customer_name: 'Tran Thi B',
          phone: '0902',
          outstanding_debt: '750000',
        },
      ]);

    const result = await service.getTopCustomers({
      granularity: ReportingGranularity.WEEK,
      from: '2026-04-06T00:00:00.000Z',
      to: '2026-04-12T23:59:59.999Z',
      purchaseLimit: 10,
      debtLimit: 10,
    });

    expect(result.topByPurchase[0]).toMatchObject({
      rank: 1,
      customerId: 'cus-1',
      totalPurchaseAmount: 500000,
    });
    expect(result.topByDebt[0]).toMatchObject({
      rank: 1,
      customerId: 'cus-2',
      outstandingDebt: 750000,
    });
  });

  it('builds export payloads from the shared reporting snapshot', async () => {
    queryMock
      .mockResolvedValueOnce([
        {
          bucket_start: '2026-04-01T00:00:00.000Z',
          revenue: '100000',
          order_count: '2',
        },
      ])
      .mockResolvedValueOnce([{ total_revenue: '100000', total_orders: '2' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await service.getReportExport({
      format: 'pdf',
      filter: {
        granularity: ReportingGranularity.DAY,
        from: '2026-04-01T00:00:00.000Z',
        to: '2026-04-01T23:59:59.999Z',
      },
    });

    expect(result.format).toBe('pdf');
    expect(result.fileName).toContain('bao-cao-day-2026-04-');
    expect(result.report.summary.totalRevenue).toBe(100000);
    expect(result.report.revenueSeries).toHaveLength(2);
  });
});
