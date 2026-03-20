import { apiGet, type PaginatedResponse } from "@/lib/api";
import { InventoryClient } from "@/components/admin/inventory-client";

export default async function InventoryPage() {
  let alerts = { lowStock: [], expiring: [], summary: { lowStockCount: 0, expiringCount: 0 } };
  let products: any[] = [];
  let categories: any[] = [];
  let units: any[] = [];
  let history = { data: [], meta: { total: 0, page: 1, limit: 50 } };

  try {
    const [alertsRes, productsRes, catsRes, unitsRes, historyRes] = await Promise.all([
      apiGet<any>("/stock/alerts"),
      apiGet<any>("/products").then((r: any) => r.data || r).catch(() => []),
      apiGet<any>("/categories").then((r: any) => r.data || r).catch(() => []),
      apiGet<any>("/units").catch(() => []),
      apiGet<any>("/stock/history?limit=50"),
    ]);
    alerts = alertsRes;
    products = productsRes;
    categories = catsRes;
    units = unitsRes;
    history = historyRes;
  } catch (e) {
    console.error("Inventory fetch error:", e);
  }

  return (
    <InventoryClient
      alerts={alerts}
      products={products}
      categories={categories}
      units={units}
      history={history}
    />
  );
}
