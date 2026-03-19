import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên hệ — Agrix",
  description: "Liên hệ Agrix để được tư vấn giải pháp quản lý nông nghiệp phù hợp.",
};

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800 }}>📞 Liên hệ</h1>
      <p style={{ color: '#6B7280', marginBottom: 32 }}>
        Gửi thông tin liên hệ, chúng tôi sẽ phản hồi trong vòng 24 giờ.
      </p>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>
            Họ và tên
          </label>
          <input
            type="text"
            name="name"
            required
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #D1D5DB', fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>
            Số điện thoại
          </label>
          <input
            type="tel"
            name="phone"
            required
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #D1D5DB', fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>
            Nội dung
          </label>
          <textarea
            name="message"
            rows={5}
            required
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #D1D5DB', fontSize: 14, resize: 'vertical',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            background: '#10B981', color: 'white', padding: '12px 24px',
            borderRadius: 8, fontWeight: 600, border: 'none',
            cursor: 'pointer', fontSize: 16,
          }}
        >
          Gửi liên hệ
        </button>
      </form>

      <div style={{ marginTop: 48, padding: 24, background: '#F9FAFB', borderRadius: 12 }}>
        <h3 style={{ fontWeight: 600 }}>Thông tin liên hệ</h3>
        <p style={{ color: '#6B7280', marginTop: 8 }}>📧 Email: contact@agrix.vn</p>
        <p style={{ color: '#6B7280' }}>📱 Hotline: 1900-AGRIX</p>
        <p style={{ color: '#6B7280' }}>📍 Địa chỉ: Việt Nam</p>
      </div>
    </main>
  );
}
