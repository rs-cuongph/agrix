"use client";

import {
  AlertsResponse,
  GrossProfitByCategoryResponse,
  ReportingExportResponse,
  ReportingFilter,
  RevenueSeriesResponse,
  RevenueSummaryResponse,
  TopCustomersResponse,
  TopProductsResponse,
} from "./reporting-types";
import { buildFilterQuery } from "./reporting-filters";

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (!res.ok) {
    let message = `API ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function getJson<T>(path: string) {
  const res = await fetch(`/api/admin/proxy?path=${encodeURIComponent(path)}`, {
    cache: "no-store",
  });
  return parseResponse<T>(res);
}

async function postJson<T>(path: string, body: unknown) {
  const res = await fetch("/api/admin/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, method: "POST", body }),
  });
  return parseResponse<T>(res);
}

export function getRevenueSummary(filter: ReportingFilter) {
  return getJson<RevenueSummaryResponse>(`/dashboard/revenue?${buildFilterQuery(filter)}`);
}

export function getRevenueSeries(filter: ReportingFilter) {
  return getJson<RevenueSeriesResponse>(
    `/dashboard/revenue-series?${buildFilterQuery(filter)}`,
  );
}

export function getTopProducts(filter: ReportingFilter, limit = 10) {
  return getJson<TopProductsResponse>(
    `/dashboard/top-products?${buildFilterQuery(filter)}&limit=${limit}`,
  );
}

export function getGrossProfitByCategory(filter: ReportingFilter) {
  return getJson<GrossProfitByCategoryResponse>(
    `/dashboard/gross-profit-by-category?${buildFilterQuery(filter)}`,
  );
}

export function getTopCustomers(filter: ReportingFilter, purchaseLimit = 10, debtLimit = 10) {
  return getJson<TopCustomersResponse>(
    `/dashboard/top-customers?${buildFilterQuery(filter)}&purchaseLimit=${purchaseLimit}&debtLimit=${debtLimit}`,
  );
}

export function getAlerts() {
  return getJson<AlertsResponse>("/dashboard/alerts");
}

export function createReportExport(format: "pdf" | "xlsx", filter: ReportingFilter) {
  return postJson<ReportingExportResponse>("/dashboard/exports", { format, filter });
}
