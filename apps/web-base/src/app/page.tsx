import type { Metadata } from 'next';
import Navbar from '@/components/landing/navbar';
import HeroSection from '@/components/landing/hero-section';
import ProductsSection from '@/components/landing/products-section';
import BlogSection from '@/components/landing/blog-section';
import TestimonialsSection from '@/components/landing/testimonials-section';
import FaqSection from '@/components/landing/faq-section';
import ContactSectionWrapper from './contact-wrapper';

export const metadata: Metadata = {
  title: 'Agrix — Nền tảng Nông nghiệp Thông minh',
  description:
    'Hệ thống quản lý bán hàng, tồn kho, và tư vấn nông nghiệp toàn diện cho đại lý vật tư nông nghiệp Việt Nam.',
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="scroll-smooth">
        <HeroSection />
        <ProductsSection />
        <BlogSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSectionWrapper />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Agrix. Tất cả quyền được bảo lưu.</p>
      </footer>
    </>
  );
}
