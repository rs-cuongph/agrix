import type { Metadata } from 'next';
import { Package } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/landing/navbar';

export const metadata: Metadata = {
  title: 'Agrix — Nền tảng Nông nghiệp Thông minh',
  description:
    'Hệ thống quản lý bán hàng, tồn kho, và tư vấn nông nghiệp toàn diện cho đại lý vật tư nông nghiệp Việt Nam.',
};

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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/public/products?limit=50`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sản phẩm
        </h1>
        <p className="text-gray-500 mb-8">
          Vật tư nông nghiệp chất lượng cao, giá cập nhật hàng ngày.
        </p>

        {products.length === 0 ? (
          <div className="py-16 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl">
            Chưa có sản phẩm. Vui lòng liên hệ để biết giá.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    {p.currentStockBase > 0
                      ? `Còn ${p.currentStockBase} ${p.baseUnit}`
                      : 'Hết hàng'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Agrix. Tất cả quyền được bảo lưu.</p>
      </footer>
    </>
  );
}
