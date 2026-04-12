import { DashboardController } from './dashboard.controller';
import { AdvancedReportingService } from './advanced-reporting.service';

describe('DashboardController', () => {
  const advancedReportingService = {
    getLegacyRevenueSummary: jest.fn(),
    getRevenueSeries: jest.fn(),
    getTopProducts: jest.fn(),
    getGrossProfitByCategory: jest.fn(),
    getTopCustomers: jest.fn(),
    getReportExport: jest.fn(),
  } as unknown as AdvancedReportingService;

  const productRepo = {} as any;
  const controller = new DashboardController(productRepo, advancedReportingService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates revenue series requests to the reporting service', async () => {
    const expected = { series: [] };
    (advancedReportingService.getRevenueSeries as jest.Mock).mockResolvedValue(expected);

    await expect(
      controller.getRevenueSeries({
        granularity: 'day' as any,
        from: '2026-04-01T00:00:00.000Z',
        to: '2026-04-01T23:59:59.999Z',
      }),
    ).resolves.toEqual(expected);
  });

  it('delegates export requests to the reporting service', async () => {
    const expected = { format: 'pdf' };
    (advancedReportingService.getReportExport as jest.Mock).mockResolvedValue(expected);

    await expect(
      controller.exportReport({
        format: 'pdf',
        filter: {
          granularity: 'day' as any,
          from: '2026-04-01T00:00:00.000Z',
          to: '2026-04-01T23:59:59.999Z',
        },
      }),
    ).resolves.toEqual(expected);
  });
});
