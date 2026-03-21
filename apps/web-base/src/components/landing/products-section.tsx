import { Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  baseUnit: string;
  baseSellPrice: number;
  category?: { name: string };
  currentStockBase: number;
  description?: string;
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/public/products?limit=8`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

export default async function ProductsSection() {
  const products = await getProducts();

  if (products.length === 0) return null;

  return (
    <section id="products" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Sản phẩm nổi bật
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Vật tư nông nghiệp chất lượng cao, giá cả hợp lý
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-200"
            >
              <div className="h-40 bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                <Package
                  size={48}
                  className="text-emerald-300 group-hover:text-emerald-400 transition-colors"
                />
              </div>
              <div className="p-4">
                {p.category && (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {p.category.name}
                  </span>
                )}
                <h3 className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {p.name}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">
                    {formatVND(p.baseSellPrice)}
                  </span>
                  <span className="text-xs text-gray-400">/{p.baseUnit}</span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {p.currentStockBase > 0 ? `Còn ${p.currentStockBase} ${p.baseUnit}` : 'Hết hàng'}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
          >
            Xem tất cả sản phẩm
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
