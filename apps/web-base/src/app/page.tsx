import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agrix — Nền tảng Nông nghiệp Thông minh",
  description: "Hệ thống quản lý bán hàng, tồn kho, và tư vấn nông nghiệp toàn diện cho đại lý vật tư nông nghiệp Việt Nam.",
};

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)',
        color: 'white',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, margin: 0 }}>
            🌿 Agrix
          </h1>
          <p style={{ fontSize: 20, opacity: 0.9, marginTop: 16 }}>
            Nền tảng quản lý nông nghiệp thông minh — Bán hàng, Tồn kho, Tư vấn AI
          </p>
          <p style={{ fontSize: 16, opacity: 0.7, maxWidth: 600, margin: '16px auto' }}>
            Giải pháp toàn diện cho đại lý vật tư nông nghiệp: POS offline-first, 
            quản lý đơn vị linh hoạt, in hóa đơn nhiệt, thanh toán VietQR, 
            và chatbot AI tư vấn kỹ thuật.
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center' }}>
            <a href="/products" style={{
              background: 'white', color: '#064E3B', padding: '12px 32px',
              borderRadius: 8, fontWeight: 600, textDecoration: 'none',
            }}>
              Xem bảng giá
            </a>
            <a href="/contact" style={{
              border: '2px solid white', color: 'white', padding: '12px 32px',
              borderRadius: 8, fontWeight: 600, textDecoration: 'none',
            }}>
              Liên hệ
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '64px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700 }}>Tính năng nổi bật</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 40 }}>
          {[
            { icon: '📱', title: 'POS Offline-First', desc: 'Bán hàng ngay cả khi mất mạng, tự động đồng bộ khi có kết nối' },
            { icon: '📦', title: 'Quản lý đơn vị linh hoạt', desc: 'Nhập Thùng → Bán Chai với quy đổi tự động và giá chính xác' },
            { icon: '🧾', title: 'In hóa đơn nhiệt', desc: 'Hỗ trợ Bluetooth LE và Wi-Fi/LAN cho máy in ESC/POS' },
            { icon: '💳', title: 'Thanh toán VietQR', desc: 'Tạo mã QR thanh toán theo chuẩn EMV, quét và xác nhận nhanh' },
            { icon: '🤖', title: 'AI Tư vấn nông nghiệp', desc: 'Chatbot RAG trả lời câu hỏi kỹ thuật dựa trên tài liệu uploaded' },
            { icon: '📊', title: 'Công nợ & Báo cáo', desc: 'Theo dõi công nợ khách hàng, báo cáo doanh thu, cảnh báo tồn kho' },
          ].map((f, i) => (
            <div key={i} style={{
              padding: 24, borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #E5E7EB',
            }}>
              <div style={{ fontSize: 32 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 600, marginTop: 12 }}>{f.title}</h3>
              <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: '#F0FDF4', padding: '48px 24px', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>Bắt đầu sử dụng Agrix ngay hôm nay</h2>
        <p style={{ color: '#6B7280', marginTop: 8 }}>Miễn phí cho đại lý nhỏ. Liên hệ để được tư vấn giải pháp phù hợp.</p>
        <a href="/contact" style={{
          display: 'inline-block', marginTop: 20,
          background: '#10B981', color: 'white', padding: '14px 40px',
          borderRadius: 8, fontWeight: 600, textDecoration: 'none',
        }}>
          Liên hệ tư vấn →
        </a>
      </section>
    </main>
  );
}
