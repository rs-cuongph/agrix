import { BookOpen, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/blog/posts?limit=6`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function BlogSection() {
  const posts = await getPosts();

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Kiến thức nông nghiệp
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Cập nhật tin tức và kỹ thuật canh tác mới nhất
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-emerald-200 transition-all duration-200"
            >
              <div className="h-44 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center overflow-hidden">
                {post.thumbnailUrl ? (
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <BookOpen
                    size={40}
                    className="text-emerald-300"
                  />
                )}
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                {post.publishedAt && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={12} />
                    {formatDate(post.publishedAt)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
          >
            Xem tất cả bài viết
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
