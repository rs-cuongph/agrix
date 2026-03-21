import type { Metadata } from 'next';
import Navbar from '@/components/landing/navbar';
import BlogSection from '@/components/landing/blog-section';

export const metadata: Metadata = {
  title: 'Blog — Agrix',
  description: 'Cập nhật tin tức và kỹ thuật canh tác nông nghiệp mới nhất.',
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <BlogSection />
      </main>
      <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Agrix. Tất cả quyền được bảo lưu.</p>
      </footer>
    </>
  );
}
