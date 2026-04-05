import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BookOpen, Calendar, User, Tag, Package, Clock, Share2, Facebook, Twitter, Linkedin, ChevronRight } from 'lucide-react';
import Navbar from '@/components/landing/navbar';
import DOMPurify from 'isomorphic-dompurify';

interface Product {
  id: string;
  name: string;
  baseUnit: string;
  baseSellPrice: number;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  category?: { name: string };
  tags?: { id: string; name: string; slug?: string }[];
  publishedAt: string;
  author?: { fullName: string; bio?: string };
  linkedProducts?: Product[];
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/blog/posts/${slug}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post ? `${post.title} — Agrix Blog` : 'Bài viết không tìm thấy',
    description: post?.excerpt || post?.content?.substring(0, 160) || '',
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

function estimateReadingTime(text: string) {
  const wordsPerMinute = 200;
  const words = text.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} phút đọc`;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 text-center bg-gray-50">
          <div className="w-24 h-24 bg-white shadow-sm rounded-full flex items-center justify-center mb-6">
            <BookOpen size={40} className="text-gray-300" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Bài viết không tồn tại</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            Rất tiếc, bài viết bạn đang tìm kiếm không có sẵn hoặc đã bị xóa.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-600/20"
          >
            <ArrowLeft size={18} />
            Quay lại trang Blog
          </Link>
        </main>
      </>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar />
      
      {/* 
        PREMIUM HERO HEADER 
        Dark emerald gradient with subtle mesh/noise feel, framing the content beautifully.
      */}
      <section className="relative pt-32 pb-40 lg:pt-40 lg:pb-56 overflow-hidden bg-emerald-950">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-950 to-green-950 opacity-90"></div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-teal-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <nav className="flex justify-center mb-8">
            <ol className="flex items-center space-x-2 text-sm font-medium text-emerald-200/70">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
              </li>
              <li><ChevronRight size={14} /></li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              </li>
              {post.category && (
                <>
                  <li><ChevronRight size={14} /></li>
                  <li className="text-white">{post.category.name}</li>
                </>
              )}
            </ol>
          </nav>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] mb-8 tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-emerald-100/80 font-medium">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                {(post.author?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-base">{post.author?.fullName || 'Đội ngũ Agrix'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-emerald-400" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" />
              <span>{estimateReadingTime(post.content)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-20 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 -mt-24 lg:-mt-40 mb-20">
        <div className="bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          
          {/* Cover Image Feature */}
          {post.coverImageUrl && (
            <div className="w-full aspect-[21/9] md:aspect-[2.5/1] overflow-hidden bg-gray-100">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          )}

          <div className="p-6 sm:p-10 lg:p-16">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* SIDEBAR STRIP (Share / Socials) - Hidden on small screens */}
              <aside className="hidden lg:flex flex-col items-center gap-6 w-12 shrink-0 pt-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  Chia sẻ
                </span>
                <div className="w-px h-12 bg-gray-200"></div>
                <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-blue-500 hover:text-white transition-colors">
                  <Facebook size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-sky-400 hover:text-white transition-colors">
                  <Twitter size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-emerald-600 hover:text-white transition-colors">
                  <Share2 size={18} />
                </button>
              </aside>

              {/* ARTICLE BODY */}
              <article 
                className="flex-1 prose-content text-gray-800 text-lg leading-relaxed
                  [&>p]:mb-8 [&>p]:leading-[1.8] [&>p]:font-light
                  [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-16 [&>h2]:mb-6 [&>h2]:tracking-tight
                  [&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-12 [&>h3]:mb-4
                  [&>ul]:list-none [&>ul]:pl-0 [&>ul]:mb-8 [&>ul>li]:relative [&>ul>li]:pl-8 [&>ul>li]:mb-4
                  [&>ul>li::before]:content-[''] [&>ul>li::before]:absolute [&>ul>li::before]:left-0 [&>ul>li::before]:top-[0.6em] [&>ul>li::before]:w-3 [&>ul>li::before]:h-3 [&>ul>li::before]:bg-emerald-400 [&>ul>li::before]:rounded-full [&>ul>li::before]:shadow-sm
                  [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-8 [&>ol>li]:mb-4 [&>ol>li]:pl-2
                  [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-500 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:bg-gradient-to-r [&>blockquote]:from-emerald-50/50 [&>blockquote]:to-transparent [&>blockquote]:py-4 [&>blockquote]:pr-4 [&>blockquote]:rounded-r-xl [&>blockquote]:mb-8 [&>blockquote]:text-gray-700
                  [&>img]:w-full [&>img]:rounded-2xl [&>img]:shadow-lg [&>img]:my-12
                  [&_a]:text-emerald-600 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-emerald-700 [&_a]:font-medium
                  [&_strong]:font-semibold [&_strong]:text-gray-900"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
              />
            </div>

            {/* AUTHOR INLINE CARD */}
            <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-white shadow-md flex items-center justify-center text-emerald-700 font-bold text-2xl shrink-0">
                {(post.author?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Tác giả bài viết</h4>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.author?.fullName || 'Đội ngũ chuyên gia Agrix'}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {post.author?.bio || 'Chuyên gia nông nghiệp với nhiều năm kinh nghiệm, luôn sẵn lòng chia sẻ kỹ thuật canh tác và xu hướng phát triển nông nghiệp bền vững tới bà con nông dân.'}
                </p>
              </div>
            </div>

            {/* TAGS */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2 items-center">
                <Tag size={18} className="text-gray-400 mr-2" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug || tag.id}`}
                    className="px-4 py-2 bg-gray-50 border border-gray-100 text-gray-600 text-sm font-medium rounded-full hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS SHOWCASE */}
        {post.linkedProducts && post.linkedProducts.length > 0 && (
          <div className="mt-12 w-full">
            <div className="flex items-center gap-3 mb-6 px-2">
              <Package size={24} className="text-emerald-600" />
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Vật tư gợi ý cho bạn</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {post.linkedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group relative bg-white flex flex-col p-6 rounded-3xl border border-gray-100 hover:border-emerald-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1"
                >
                  {/* Subtle background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/50 group-hover:to-transparent transition-colors duration-300"></div>
                  
                  <div className="relative z-10 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center mb-5 group-hover:bg-emerald-100 transition-colors">
                      <Package size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug mb-2">
                      {product.name}
                    </h4>
                  </div>
                  
                  <div className="relative z-10 mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Giá bán</p>
                      <p className="text-lg font-extrabold text-emerald-600">
                        {formatVND(product.baseSellPrice)}
                        <span className="text-gray-400 font-normal text-sm ml-1">/{product.baseUnit}</span>
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 text-center text-sm border-t border-gray-800 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Agrix. Cập nhật kỹ thuật canh tác hàng ngày.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <Link href="/products" className="hover:text-white transition-colors">Vật tư</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Liên hệ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
