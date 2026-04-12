import 'reflect-metadata';
import {
  formatBucketLabel,
  normalizeReportingFilter,
  toSerializableFilter,
} from './reporting-range.util';
import { ReportingGranularity } from './dto/reporting-filter.dto';

describe('reporting-range.util', () => {
  it('normalizes filter dates and granularity', () => {
    const filter = normalizeReportingFilter({
      granularity: ReportingGranularity.MONTH,
      from: '2026-04-01T10:00:00.000Z',
      to: '2026-04-30T10:00:00.000Z',
    });

    expect(filter.granularity).toBe(ReportingGranularity.MONTH);
    expect(filter.from.toISOString()).toBe('2026-03-31T17:00:00.000Z');
    expect(filter.to.toISOString()).toBe('2026-04-30T16:59:59.999Z');
    expect(toSerializableFilter(filter)).toEqual({
      granularity: ReportingGranularity.MONTH,
      from: '2026-03-31T17:00:00.000Z',
      to: '2026-04-30T16:59:59.999Z',
    });
  });

  it('formats week labels with a visible range', () => {
    const label = formatBucketLabel(
      new Date('2026-04-06T00:00:00.000Z'),
      ReportingGranularity.WEEK,
    );

    expect(label).toBe('06/04 - 13/04');
  });
});
