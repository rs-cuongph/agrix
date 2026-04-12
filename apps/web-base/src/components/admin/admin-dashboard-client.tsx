"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, BarChart3 } from "lucide-react";
import { GrossProfitCategoryTable } from "@/components/admin/gross-profit-category-table";
import { ReportingExportActions } from "@/components/admin/reporting-export-actions";
import { ReportingFilterToolbar } from "@/components/admin/reporting-filter-toolbar";
import { RevenueSeriesChart } from "@/components/admin/revenue-series-chart";
import { RevenueSummaryCards } from "@/components/admin/revenue-summary-cards";
import { TopCustomersPanel } from "@/components/admin/top-customers-panel";
import { TopProductsTable } from "@/components/admin/top-products-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getAlerts,
  getGrossProfitByCategory,
  getRevenueSeries,
  getRevenueSummary,
  getTopCustomers,
  getTopProducts,
} from "@/lib/admin/reporting-api";
import { getDefaultFilter, getFilterLabel } from "@/lib/admin/reporting-filters";
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
    rangeLabel: "Hôm nay",
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
          setError(loadError instanceof Error ? loadError.message : "Không thể tải dashboard");
        });
    });
  };

  useEffect(() => {
    loadDashboard(filter);
  }, [filter]);

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="gap-4 lg:flex lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
              <BarChart3 className="size-6 text-emerald-600" />
              Báo cáo nâng cao
            </CardTitle>
            <CardDescription>
              Theo dõi doanh thu, lợi nhuận gộp, sản phẩm bán chạy, khách hàng và báo cáo xuất ra.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Separator />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <ReportingFilterToolbar
          filter={filter}
          pending={isPending}
          onChange={setFilter}
          onRefresh={() => loadDashboard(filter)}
        />
        <ReportingExportActions filter={filter} />
      </div>

      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <RevenueSummaryCards summary={summary} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <RevenueSeriesChart points={revenueSeries.series} />
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Cảnh báo tồn kho
            </CardTitle>
            <CardDescription>
              Danh sách sản phẩm đang ở mức tồn thấp cần ưu tiên xử lý.
            </CardDescription>
          </CardHeader>
          <CardContent>

            {alerts.lowStock.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Không có cảnh báo tồn kho trong thời điểm hiện tại.
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
                    <Badge variant="outline">
                      {item.currentStock} {item.baseUnit}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TopProductsTable items={topProducts.items} />
        <GrossProfitCategoryTable items={grossProfit.items} />
      </div>

      <TopCustomersPanel
        topByPurchase={topCustomers.topByPurchase}
        topByDebt={topCustomers.topByDebt}
      />
    </div>
  );
}
