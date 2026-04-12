import {
  ReportingFilterDto,
  ReportingGranularity,
} from './dto/reporting-filter.dto';

export interface NormalizedReportingFilter {
  granularity: ReportingGranularity;
  from: Date;
  to: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(value: Date) {
  const next = startOfDay(value);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function endOfWeek(value: Date) {
  const next = startOfWeek(value);
  next.setDate(next.getDate() + 6);
  return endOfDay(next);
}

function startOfMonth(value: Date) {
  const next = startOfDay(value);
  next.setDate(1);
  return next;
}

function endOfMonth(value: Date) {
  const next = startOfMonth(value);
  next.setMonth(next.getMonth() + 1);
  next.setDate(0);
  return endOfDay(next);
}

function startOfYear(value: Date) {
  const next = startOfDay(value);
  next.setMonth(0, 1);
  return next;
}

function endOfYear(value: Date) {
  const next = startOfYear(value);
  next.setFullYear(next.getFullYear() + 1);
  next.setDate(0);
  return endOfDay(next);
}

export function normalizeReportingFilter(
  filter?: ReportingFilterDto,
): NormalizedReportingFilter {
  const granularity = filter?.granularity ?? ReportingGranularity.DAY;
  const now = new Date();

  const fallbackFrom = (() => {
    switch (granularity) {
      case ReportingGranularity.WEEK:
        return startOfWeek(now);
      case ReportingGranularity.MONTH:
        return startOfMonth(now);
      case ReportingGranularity.YEAR:
        return startOfYear(now);
      case ReportingGranularity.DAY:
      default:
        return startOfDay(now);
    }
  })();

  const fallbackTo = (() => {
    switch (granularity) {
      case ReportingGranularity.WEEK:
        return endOfWeek(now);
      case ReportingGranularity.MONTH:
        return endOfMonth(now);
      case ReportingGranularity.YEAR:
        return endOfYear(now);
      case ReportingGranularity.DAY:
      default:
        return endOfDay(now);
    }
  })();

  const from = filter?.from ? startOfDay(new Date(filter.from)) : fallbackFrom;
  const to = filter?.to ? endOfDay(new Date(filter.to)) : fallbackTo;

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new Error('Invalid reporting date range');
  }

  if (from > to) {
    throw new Error('Reporting "from" date must be before "to" date');
  }

  return { granularity, from, to };
}

export function toSerializableFilter(filter: NormalizedReportingFilter) {
  return {
    granularity: filter.granularity,
    from: filter.from.toISOString(),
    to: filter.to.toISOString(),
  };
}

export function getBucketSql(granularity: ReportingGranularity) {
  switch (granularity) {
    case ReportingGranularity.WEEK:
      return "date_trunc('week', o.created_at)";
    case ReportingGranularity.MONTH:
      return "date_trunc('month', o.created_at)";
    case ReportingGranularity.YEAR:
      return "date_trunc('year', o.created_at)";
    case ReportingGranularity.DAY:
    default:
      return "date_trunc('day', o.created_at)";
  }
}

export function addBucket(value: Date, granularity: ReportingGranularity) {
  const next = new Date(value);
  switch (granularity) {
    case ReportingGranularity.WEEK:
      next.setDate(next.getDate() + 7);
      return next;
    case ReportingGranularity.MONTH:
      next.setMonth(next.getMonth() + 1);
      return next;
    case ReportingGranularity.YEAR:
      next.setFullYear(next.getFullYear() + 1);
      return next;
    case ReportingGranularity.DAY:
    default:
      return new Date(next.getTime() + DAY_MS);
  }
}

export function getBucketEnd(value: Date, granularity: ReportingGranularity) {
  const next = addBucket(value, granularity);
  return new Date(next.getTime() - 1);
}

export function formatBucketLabel(
  value: Date,
  granularity: ReportingGranularity,
) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  switch (granularity) {
    case ReportingGranularity.WEEK: {
      const end = getBucketEnd(value, granularity);
      const endMonth = String(end.getMonth() + 1).padStart(2, '0');
      const endDay = String(end.getDate()).padStart(2, '0');
      return `${day}/${month} - ${endDay}/${endMonth}`;
    }
    case ReportingGranularity.MONTH:
      return `${month}/${year}`;
    case ReportingGranularity.YEAR:
      return String(year);
    case ReportingGranularity.DAY:
    default:
      return `${day}/${month}/${year}`;
  }
}
