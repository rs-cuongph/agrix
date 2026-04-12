import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DashboardController } from '../../src/dashboard/dashboard.controller';
import { AdvancedReportingService } from '../../src/dashboard/advanced-reporting.service';
import { ReportingFilterDto } from '../../src/dashboard/dto/reporting-filter.dto';

describe('Revenue series contract', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  });
  const advancedReportingService = {
    getRevenueSeries: jest.fn(),
  } as unknown as AdvancedReportingService;
  const controller = new DashboardController(
    {} as any,
    advancedReportingService,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('accepts a valid reporting filter and returns the revenue series payload', async () => {
    const query = (await pipe.transform(
      {
        granularity: 'month',
        from: '2026-04-01T00:00:00.000Z',
        to: '2026-04-30T23:59:59.999Z',
      },
      {
        type: 'query',
        metatype: ReportingFilterDto,
      },
    )) as ReportingFilterDto;
    const expected = {
      filter: {
        granularity: 'month',
        from: '2026-04-01T00:00:00.000Z',
        to: '2026-04-30T23:59:59.999Z',
      },
      summary: {
        totalRevenue: 500000,
        totalOrders: 4,
        totalProducts: 12,
        totalCustomers: 3,
      },
      series: [
        {
          bucketLabel: '04/2026',
          bucketStart: '2026-04-01T00:00:00.000Z',
          bucketEnd: '2026-04-30T23:59:59.999Z',
          revenue: 500000,
          orderCount: 4,
        },
      ],
    };
    (advancedReportingService.getRevenueSeries as jest.Mock).mockResolvedValue(
      expected,
    );

    await expect(controller.getRevenueSeries(query)).resolves.toEqual(expected);
    expect(advancedReportingService.getRevenueSeries).toHaveBeenCalledWith(
      expect.objectContaining({
        granularity: 'month',
        from: '2026-04-01T00:00:00.000Z',
        to: '2026-04-30T23:59:59.999Z',
      }),
    );
  });

  it('rejects an invalid granularity before calling the reporting service', async () => {
    await expect(
      pipe.transform(
        {
          granularity: 'quarter',
          from: '2026-04-01T00:00:00.000Z',
          to: '2026-04-30T23:59:59.999Z',
        },
        {
          type: 'query',
          metatype: ReportingFilterDto,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(advancedReportingService.getRevenueSeries).not.toHaveBeenCalled();
  });
});
