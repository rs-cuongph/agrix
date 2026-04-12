"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { GrossProfitCategoryTable } from "@/components/admin/gross-profit-category-table";
import { ReportingExportActions } from "@/components/admin/reporting-export-actions";
import { ReportingFilterToolbar } from "@/components/admin/reporting-filter-toolbar";
import { RevenueSeriesChart } from "@/components/admin/revenue-series-chart";
import { RevenueSummaryCards } from "@/components/admin/revenue-summary-cards";
import { TopCustomersPanel } from "@/components/admin/top-customers-panel";
import { TopProductsTable } from "@/components/admin/top-products-table";
import {
  getAlerts,
  getGrossProfitByCategory,
  getRevenueSeries,
  getRevenueSummary,
  getTopCustomers,
  getTopProducts,
} from "@/lib/admin/reporting-api";
import { getDefaultFilter } from "@/lib/admin/reporting-filters";
import {
  AlertsResponse,
  GrossProfitByCategoryResponse,
  ReportingFilter,
  RevenueSeriesResponse,
  RevenueSummaryResponse,
  TopCustomersResponse,
  TopProductsResponse,
} from "@/lib/admin/reporting-types";

export function AdminDashboardClient() {
  const [filter, setFilter] = useState<ReportingFilter>(getDefaultFilter("day"));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<RevenueSummaryResponse>({
    filter: {
      granularity: "day",
      from: new Date().toISOString(),
      to: new Date().toISOString(),
    },
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    rangeLabel: "Hom nay",
  });
  const [revenueSeries, setRevenueSeries] = useState<RevenueSeriesResponse>({
    filter: {
      granularity: "day",
      from: new Date().toISOString(),
      to: new Date().toISOString(),
    },
    summary: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
    },
    series: [],
  });
  const [topProducts, setTopProducts] = useState<TopProductsResponse>({ filter, items: [] });
  const [grossProfit, setGrossProfit] = useState<GrossProfitByCategoryResponse>({
    filter,
    items: [],
  });
  const [topCustomers, setTopCustomers] = useState<TopCustomersResponse>({
    filter,
    topByPurchase: [],
    topByDebt: [],
  });
  const [alerts, setAlerts] = useState<AlertsResponse>({ lowStock: [] });

  const loadDashboard = (nextFilter: ReportingFilter) => {
    startTransition(() => {
      Promise.all([
        getRevenueSummary(nextFilter),
        getRevenueSeries(nextFilter),
        getTopProducts(nextFilter),
        getGrossProfitByCategory(nextFilter),
        getTopCustomers(nextFilter),
        getAlerts(),
      ])
        .then(([summaryData, seriesData, topProductsData, grossProfitData, topCustomersData, alertsData]) => {
          setSummary(summaryData);
          setRevenueSeries(seriesData);
          setTopProducts(topProductsData);
          setGrossProfit(grossProfitData);
          setTopCustomers(topCustomersData);
          setAlerts(alertsData);
          setError("");
        })
        .catch((loadError) => {
          setError(loadError instanceof Error ? loadError.message : "Khong the tai dashboard");
        });
    });
  };

  useEffect(() => {
    loadDashboard(filter);
  }, [filter]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Bao cao nang cao
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo doi doanh thu, loi nhuan gop, san pham, khach hang va xuat so sach.
        </p>
      </div>

      <ReportingFilterToolbar
        filter={filter}
        pending={isPending}
        onChange={setFilter}
        onRefresh={() => loadDashboard(filter)}
      />

      <ReportingExportActions filter={filter} />

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <RevenueSummaryCards summary={summary} />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <RevenueSeriesChart points={revenueSeries.series} />
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            <div>
              <h2 className="text-base font-semibold text-foreground">Canh bao ton kho</h2>
              <p className="text-sm text-muted-foreground">
                Danh sach san pham dang o muc ton thap
              </p>
            </div>
          </div>

          {alerts.lowStock.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Khong co canh bao ton kho
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                  </div>
                  <p className="text-sm font-semibold text-amber-600">
                    {item.currentStock} {item.baseUnit}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TopProductsTable items={topProducts.items} />
      <GrossProfitCategoryTable items={grossProfit.items} />
      <TopCustomersPanel
        topByPurchase={topCustomers.topByPurchase}
        topByDebt={topCustomers.topByDebt}
      />
    </div>
  );
}
