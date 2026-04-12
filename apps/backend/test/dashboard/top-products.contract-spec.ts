import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DashboardController } from '../../src/dashboard/dashboard.controller';
import { AdvancedReportingService } from '../../src/dashboard/advanced-reporting.service';
import { RankingQueryDto } from '../../src/dashboard/dto/reporting-filter.dto';

describe('Top products contract', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  });
  const advancedReportingService = {
    getTopProducts: jest.fn(),
  } as unknown as AdvancedReportingService;
  const controller = new DashboardController(
    {} as any,
    advancedReportingService,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('parses ranking filters and returns the ranked top-products payload', async () => {
    const query = (await pipe.transform(
      {
        granularity: 'week',
        from: '2026-04-06T00:00:00.000Z',
        to: '2026-04-12T23:59:59.999Z',
        limit: '5',
      },
      {
        type: 'query',
        metatype: RankingQueryDto,
      },
    )) as RankingQueryDto;
    const expected = {
      filter: {
        granularity: 'week',
        from: '2026-04-06T00:00:00.000Z',
        to: '2026-04-12T23:59:59.999Z',
      },
      items: [
        {
          rank: 1,
          productId: 'prod-1',
          sku: 'SKU-001',
          productName: 'Hat giong A',
          categoryName: 'Hat giong',
          quantitySold: 20,
          revenueContribution: 900000,
        },
        {
          rank: 2,
          productId: 'prod-2',
          sku: 'SKU-002',
          productName: 'Hat giong B',
          categoryName: 'Hat giong',
          quantitySold: 12,
          revenueContribution: 400000,
        },
      ],
    };
    (advancedReportingService.getTopProducts as jest.Mock).mockResolvedValue(
      expected,
    );

    await expect(controller.getTopProducts(query)).resolves.toEqual(expected);
    expect(advancedReportingService.getTopProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        granularity: 'week',
        from: '2026-04-06T00:00:00.000Z',
        to: '2026-04-12T23:59:59.999Z',
        limit: 5,
      }),
    );
  });

  it('rejects ranking queries that exceed the supported limit', async () => {
    await expect(
      pipe.transform(
        {
          granularity: 'week',
          from: '2026-04-06T00:00:00.000Z',
          to: '2026-04-12T23:59:59.999Z',
          limit: '51',
        },
        {
          type: 'query',
          metatype: RankingQueryDto,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(advancedReportingService.getTopProducts).not.toHaveBeenCalled();
  });
});
