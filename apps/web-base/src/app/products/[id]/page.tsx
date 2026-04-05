import type { Metadata } from 'next';
import { ArrowLeft, Package, Phone } from 'lucide-react';
import Link from 'next/link';
import { ProductGallery } from '@/components/public/product-gallery';
import DOMPurify from 'isomorphic-dompurify';

interface Product {
  id: string;
  name: string;
  baseUnit: string;
  baseSellPrice: number;
  category?: { name: string };
  currentStockBase: number;
  description?: string;
  sku?: string;
  imageUrls?: string[];
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/public/products/${id}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return {
    title: product ? `${product.name} — Agrix` : 'Sản phẩm — Agrix',
    description: product?.description || 'Chi tiết sản phẩm vật tư nông nghiệp Agrix',
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h1>
        <p className="text-gray-500 mt-2">
          Sản phẩm này có thể đã bị xóa hoặc không tồn tại.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 mt-6 text-emerald-600 font-semibold hover:text-emerald-700"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách sản phẩm
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 pt-20">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 mb-8 transition-colors"
      >
        <ArrowLeft size={14} />
        Quay lại
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProductGallery images={product.imageUrls} productName={product.name} />

        {/* Product Info */}
        <div>
          {product.category && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {product.category.name}
            </span>
          )}
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {formatVND(product.baseSellPrice)}
            </span>
            <span className="text-sm text-gray-400">/ {product.baseUnit}</span>
          </div>

          <div className="mt-4 text-sm">
            {product.currentStockBase > 0 ? (
              <span className="text-emerald-600 font-medium">
                Còn {product.currentStockBase} {product.baseUnit}
              </span>
            ) : (
              <span className="text-red-500 font-medium">Tạm hết hàng</span>
            )}
          </div>

          {product.sku && (
            <p className="mt-2 text-xs text-gray-400">
              Mã sản phẩm: {product.sku}
            </p>
          )}

          <a
            href="#contact"
            className="mt-6 inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
          >
            <Phone size={18} />
            Liên hệ tư vấn
          </a>

          {product.description && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-base font-bold text-gray-900 mb-2">Mô tả sản phẩm</h2>
              <div 
                className="text-sm text-gray-600 leading-relaxed [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-2 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-bold [&>h3]:mt-3 [&>h3]:mb-1 [&_a]:text-emerald-600 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
