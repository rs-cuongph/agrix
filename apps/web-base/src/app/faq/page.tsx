import type { Metadata } from 'next';
import Navbar from '@/components/landing/navbar';
import FaqSection from '@/components/landing/faq-section';

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp — Agrix',
  description: 'Giải đáp các thắc mắc thường gặp về sản phẩm và dịch vụ của Agrix.',
};

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <FaqSection />
      </main>
      <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Agrix. Tất cả quyền được bảo lưu.</p>
      </footer>
    </>
  );
}
