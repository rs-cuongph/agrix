import { ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface HeroData {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
}

async function getSettings(): Promise<HeroData> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/public/settings`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export default async function HeroSection() {
  const settings = await getSettings();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-500 text-white pt-24 pb-20 px-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
          {settings.heroTitle || 'Nền tảng Nông nghiệp Thông minh'}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
          {settings.heroSubtitle ||
            'Giải pháp toàn diện cho đại lý vật tư nông nghiệp: quản lý tồn kho, bán hàng, và chatbot AI tư vấn kỹ thuật.'}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-emerald-50 transition-all duration-200"
          >
            Xem sản phẩm
            <ArrowRight size={18} />
          </Link>
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            <MessageCircle size={18} />
            Liên hệ tư vấn
          </a>
        </div>
      </div>
    </section>
  );
}
