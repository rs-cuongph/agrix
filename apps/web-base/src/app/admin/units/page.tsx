import { apiGet, type PaginatedResponse } from "@/lib/api";
import { UnitsClient } from "@/components/admin/units-client";

type BaseUnit = { id: string; name: string; abbreviation?: string; description?: string };

type UnitConversion = {
  id: string; productId: string; unitName: string;
  conversionFactor: number; sellPrice: number | null;
  product: { id: string; name: string; baseUnit: string; baseSellPrice: number };
};

type Product = { id: string; name: string; baseUnit: string; baseSellPrice: number };

export default async function UnitsPage() {
  let baseUnits: BaseUnit[] = [];
  let conversions: UnitConversion[] = [];
  let products: Product[] = [];
  try {
    const [baseRes, convRes, prodRes] = await Promise.all([
      apiGet<BaseUnit[]>("/units"),
      apiGet<UnitConversion[]>("/unit-conversions"),
      apiGet<PaginatedResponse<Product>>("/products"),
    ]);
    baseUnits = baseRes;
    conversions = convRes;
    products = prodRes.data;
  } catch (e) {
    console.error("Units fetch error:", e);
  }

  return <UnitsClient baseUnits={baseUnits} conversions={conversions} products={products} />;
}
