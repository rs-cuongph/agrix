export type ReportingGranularity = 'day' | 'week' | 'month' | 'year';

export interface ReportingFilter {
  granularity: ReportingGranularity;
  from: string;
  to: string;
}

export interface RevenueSeriesPoint {
  bucketLabel: string;
  bucketStart: string;
  bucketEnd: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export interface RevenueSeriesResponse {
  filter: ReportingFilter;
  summary: RevenueSummary;
  series: RevenueSeriesPoint[];
}

export interface TopProductRecord {
  rank: number;
  productId: string;
  sku: string;
  productName: string;
  categoryName: string | null;
  quantitySold: number;
  revenueContribution: number;
}

export interface TopProductsResponse {
  filter: ReportingFilter;
  items: TopProductRecord[];
}

export interface CategoryGrossProfitRecord {
  categoryId: string | null;
  categoryName: string;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  hasIncompleteCostData: boolean;
  missingCostOrderCount: number;
}

export interface GrossProfitByCategoryResponse {
  filter: ReportingFilter;
  items: CategoryGrossProfitRecord[];
}

export interface CustomerPurchaseRecord {
  rank: number;
  customerId: string;
  customerName: string;
  phone: string | null;
  orderCount: number;
  totalPurchaseAmount: number;
}

export interface CustomerDebtRecord {
  rank: number;
  customerId: string;
  customerName: string;
  phone: string | null;
  outstandingDebt: number;
  lastDebtActivityAt: string | null;
}

export interface TopCustomersResponse {
  filter: ReportingFilter;
  topByPurchase: CustomerPurchaseRecord[];
  topByDebt: CustomerDebtRecord[];
}

export interface ReportingExportSnapshot {
  filter: ReportingFilter;
  summary: RevenueSummary;
  revenueSeries: RevenueSeriesPoint[];
  topProducts: TopProductRecord[];
  grossProfitByCategory: CategoryGrossProfitRecord[];
  topCustomersByPurchase: CustomerPurchaseRecord[];
  topCustomersByDebt: CustomerDebtRecord[];
}

export interface ReportExportResponse {
  format: 'pdf' | 'xlsx';
  fileName: string;
  mimeType: string;
  generatedAt: string;
  report: ReportingExportSnapshot;
}
