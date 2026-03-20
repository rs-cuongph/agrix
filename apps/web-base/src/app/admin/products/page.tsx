import { apiGet, type PaginatedResponse } from "@/lib/api";
import { ProductsClient } from "@/components/admin/products-client";

type Product = {
  id: string; sku: string; name: string; baseUnit: string;
  baseSellPrice: number; baseCostPrice: number; currentStockBase: number;
  isActive: boolean; categoryId: string; barcodeEan13?: string;
  description?: string; usageInstructions?: string;
};

type Category = { id: string; name: string };

export default async function ProductsPage() {
  let products: Product[] = [];
  let categories: Category[] = [];
  try {
    const [prodRes, catRes] = await Promise.all([
      apiGet<PaginatedResponse<Product>>("/products"),
      apiGet<Category[]>("/categories"),
    ]);
    products = prodRes.data;
    categories = catRes;
  } catch (e) {
    console.error("Products fetch error:", e);
  }

  return <ProductsClient products={products} categories={categories} />;
}
