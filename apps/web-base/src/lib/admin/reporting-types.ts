export type ReportingGranularity = "day" | "week" | "month" | "year";

export type ReportingFilter = {
  granularity: ReportingGranularity;
  from: string;
  to: string;
};

export type RevenueSummaryResponse = {
  filter: ReportingFilter;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  rangeLabel: string;
};

export type RevenueSeriesPoint = {
  bucketLabel: string;
  bucketStart: string;
  bucketEnd: string;
  revenue: number;
  orderCount: number;
};

export type RevenueSeriesResponse = {
  filter: ReportingFilter;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
  series: RevenueSeriesPoint[];
};

export type TopProductRecord = {
  rank: number;
  productId: string;
  sku: string;
  productName: string;
  categoryName: string | null;
  quantitySold: number;
  revenueContribution: number;
};

export type TopProductsResponse = {
  filter: ReportingFilter;
  items: TopProductRecord[];
};

export type CategoryGrossProfitRecord = {
  categoryId: string | null;
  categoryName: string;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  hasIncompleteCostData: boolean;
  missingCostOrderCount: number;
};

export type GrossProfitByCategoryResponse = {
  filter: ReportingFilter;
  items: CategoryGrossProfitRecord[];
};

export type CustomerPurchaseRecord = {
  rank: number;
  customerId: string;
  customerName: string;
  phone: string | null;
  orderCount: number;
  totalPurchaseAmount: number;
};

export type CustomerDebtRecord = {
  rank: number;
  customerId: string;
  customerName: string;
  phone: string | null;
  outstandingDebt: number;
  lastDebtActivityAt: string | null;
};

export type TopCustomersResponse = {
  filter: ReportingFilter;
  topByPurchase: CustomerPurchaseRecord[];
  topByDebt: CustomerDebtRecord[];
};

export type AlertsResponse = {
  lowStock: {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    baseUnit: string;
  }[];
};

export type ReportingExportResponse = {
  format: "pdf" | "xlsx";
  fileName: string;
  mimeType: string;
  generatedAt: string;
  report: {
    filter: ReportingFilter;
    summary: RevenueSeriesResponse["summary"];
    revenueSeries: RevenueSeriesPoint[];
    topProducts: TopProductRecord[];
    grossProfitByCategory: CategoryGrossProfitRecord[];
    topCustomersByPurchase: CustomerPurchaseRecord[];
    topCustomersByDebt: CustomerDebtRecord[];
  };
};
