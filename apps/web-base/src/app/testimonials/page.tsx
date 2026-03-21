import type { Metadata } from 'next';
import Navbar from '@/components/landing/navbar';
import TestimonialsSection from '@/components/landing/testimonials-section';

export const metadata: Metadata = {
  title: 'Đánh giá khách hàng — Agrix',
  description: 'Đánh giá và nhận xét từ khách hàng về dịch vụ và sản phẩm của Agrix.',
};

export default function TestimonialsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <TestimonialsSection />
      </main>
      <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Agrix. Tất cả quyền được bảo lưu.</p>
      </footer>
    </>
  );
}
