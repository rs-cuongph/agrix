import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DashboardController } from '../../src/dashboard/dashboard.controller';
import { AdvancedReportingService } from '../../src/dashboard/advanced-reporting.service';
import { ExportReportDto } from '../../src/dashboard/dto/reporting-filter.dto';

describe('Dashboard exports contract', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  });
  const advancedReportingService = {
    getReportExport: jest.fn(),
  } as unknown as AdvancedReportingService;
  const controller = new DashboardController(
    {} as any,
    advancedReportingService,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('accepts a valid export request and returns the export metadata payload', async () => {
    const body = (await pipe.transform(
      {
        format: 'pdf',
        filter: {
          granularity: 'month',
          from: '2026-04-01T00:00:00.000Z',
          to: '2026-04-30T23:59:59.999Z',
        },
      },
      {
        type: 'body',
        metatype: ExportReportDto,
      },
    )) as ExportReportDto;
    const expected = {
      format: 'pdf',
      fileName: 'bao-cao-month-2026-04-30.pdf',
      mimeType: 'application/pdf',
      generatedAt: '2026-04-30T10:00:00.000Z',
      report: {
        filter: body.filter,
        summary: {
          totalRevenue: 500000,
          totalOrders: 4,
          totalProducts: 12,
          totalCustomers: 3,
        },
        revenueSeries: [],
        topProducts: [],
        grossProfitByCategory: [],
        topCustomersByPurchase: [],
        topCustomersByDebt: [],
      },
    };
    (advancedReportingService.getReportExport as jest.Mock).mockResolvedValue(
      expected,
    );

    await expect(controller.exportReport(body)).resolves.toEqual(expected);
    expect(advancedReportingService.getReportExport).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'pdf',
        filter: expect.objectContaining({
          granularity: 'month',
          from: '2026-04-01T00:00:00.000Z',
          to: '2026-04-30T23:59:59.999Z',
        }),
      }),
    );
  });

  it('rejects invalid export formats before hitting the reporting service', async () => {
    await expect(
      pipe.transform(
        {
          format: 'csv',
          filter: {
            granularity: 'month',
            from: '2026-04-01T00:00:00.000Z',
            to: '2026-04-30T23:59:59.999Z',
          },
        },
        {
          type: 'body',
          metatype: ExportReportDto,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(advancedReportingService.getReportExport).not.toHaveBeenCalled();
  });
});
