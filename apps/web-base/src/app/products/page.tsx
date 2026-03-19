import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng giá sản phẩm — Agrix",
  description: "Xem bảng giá vật tư nông nghiệp mới nhất: thuốc trừ sâu, phân bón, hạt giống.",
};

interface Product {
  id: string;
  name: string;
  baseUnit: string;
  baseSellPrice: number;
  category?: { name: string };
  currentStockBase: number;
}

async function getProducts(): Promise<{ items: Product[]; total: number }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/products?limit=50`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { items: [], total: 0 };
    return res.json();
  } catch {
    return { items: [], total: 0 };
  }
}

function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

export default async function ProductsPage() {
  const { items: products } = await getProducts();

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800 }}>💰 Bảng giá sản phẩm</h1>
      <p style={{ color: '#6B7280', marginBottom: 32 }}>
        Giá cập nhật hàng ngày. Liên hệ để nhận báo giá sỉ.
      </p>

      {products.length === 0 ? (
        <div style={{
          padding: 40, textAlign: 'center', color: '#9CA3AF',
          border: '1px dashed #E5E7EB', borderRadius: 12,
        }}>
          Chưa có sản phẩm. Vui lòng liên hệ để biết giá.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
              <th style={{ padding: '12px 8px' }}>Sản phẩm</th>
              <th style={{ padding: '12px 8px' }}>Danh mục</th>
              <th style={{ padding: '12px 8px' }}>Đơn vị</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>Giá bán</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>Tồn kho</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '12px 8px', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '12px 8px', color: '#6B7280' }}>{p.category?.name || '—'}</td>
                <td style={{ padding: '12px 8px' }}>{p.baseUnit}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#10B981', fontWeight: 600 }}>
                  {formatVND(p.baseSellPrice)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: p.currentStockBase > 0 ? '#374151' : '#EF4444' }}>
                  {p.currentStockBase > 0 ? `${p.currentStockBase} ${p.baseUnit}` : 'Hết hàng'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
