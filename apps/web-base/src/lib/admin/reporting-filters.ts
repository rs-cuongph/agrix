import { ReportingFilter, ReportingGranularity } from "./reporting-types";

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function endOfWeek(date: Date) {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  return endOfDay(next);
}

function startOfMonth(date: Date) {
  const next = startOfDay(date);
  next.setDate(1);
  return next;
}

function endOfMonth(date: Date) {
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return endOfDay(next);
}

function startOfYear(date: Date) {
  return startOfDay(new Date(date.getFullYear(), 0, 1));
}

function endOfYear(date: Date) {
  return endOfDay(new Date(date.getFullYear(), 11, 31));
}

export function getDefaultFilter(
  granularity: ReportingGranularity = "day",
): ReportingFilter {
  const now = new Date();

  const [from, to] = (() => {
    switch (granularity) {
      case "week":
        return [startOfWeek(now), endOfWeek(now)];
      case "month":
        return [startOfMonth(now), endOfMonth(now)];
      case "year":
        return [startOfYear(now), endOfYear(now)];
      case "day":
      default:
        return [startOfDay(now), endOfDay(now)];
    }
  })();

  return {
    granularity,
    from: formatDateInput(from),
    to: formatDateInput(to),
  };
}

export function buildFilterQuery(filter: ReportingFilter) {
  const params = new URLSearchParams();
  params.set("granularity", filter.granularity);
  params.set("from", new Date(`${filter.from}T00:00:00`).toISOString());
  params.set("to", new Date(`${filter.to}T23:59:59`).toISOString());
  return params.toString();
}

export function getFilterLabel(filter: ReportingFilter) {
  return `${filter.from} -> ${filter.to}`;
}
