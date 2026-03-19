import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Agrix",
  description: "Kiến thức nông nghiệp, hướng dẫn kỹ thuật, và tin tức mới nhất từ Agrix.",
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  coverImageUrl?: string;
}

async function getPosts(): Promise<{ items: BlogPost[]; total: number }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/blog/posts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { items: [], total: 0 };
    return res.json();
  } catch {
    return { items: [], total: 0 };
  }
}

export default async function BlogPage() {
  const { items: posts } = await getPosts();

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800 }}>📝 Blog Nông nghiệp</h1>
      <p style={{ color: '#6B7280', marginBottom: 32 }}>
        Kiến thức kỹ thuật, hướng dẫn sử dụng sản phẩm, và tin tức ngành nông nghiệp.
      </p>

      {posts.length === 0 ? (
        <div style={{
          padding: 40, textAlign: 'center', color: '#9CA3AF',
          border: '1px dashed #E5E7EB', borderRadius: 12,
        }}>
          Chưa có bài viết nào. Hãy quay lại sau!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {posts.map((post) => (
            <a
              key={post.id}
              href={`/blog/${post.slug}`}
              style={{
                display: 'block', padding: 24, borderRadius: 12,
                border: '1px solid #E5E7EB', textDecoration: 'none', color: 'inherit',
                transition: 'box-shadow 0.2s',
              }}
            >
              <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>
                {post.category || 'Chung'}
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>{post.title}</h2>
              <p style={{ color: '#6B7280', fontSize: 14, marginTop: 8 }}>{post.excerpt}</p>
              <span style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8, display: 'block' }}>
                {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
              </span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
