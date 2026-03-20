import { apiGet, type PaginatedResponse } from "@/lib/api";
import { UnitsClient } from "@/components/admin/units-client";

type UnitConversion = {
  id: string; productId: string; unitName: string;
  conversionFactor: number; sellPrice: number | null;
  product: { id: string; name: string; baseUnit: string; baseSellPrice: number };
};

type Product = { id: string; name: string; baseUnit: string; baseSellPrice: number };

export default async function UnitsPage() {
  let units: UnitConversion[] = [];
  let products: Product[] = [];
  try {
    const [unitsRes, prodRes] = await Promise.all([
      apiGet<UnitConversion[]>("/unit-conversions"),
      apiGet<PaginatedResponse<Product>>("/products"),
    ]);
    units = unitsRes;
    products = prodRes.data;
  } catch (e) {
    console.error("Units fetch error:", e);
  }

  return <UnitsClient units={units} products={products} />;
}
