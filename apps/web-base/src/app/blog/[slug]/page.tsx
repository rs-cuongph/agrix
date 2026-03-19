import type { Metadata } from "next";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  publishedAt: string;
  author?: { fullName: string };
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
    description: post?.content?.substring(0, 160) || '',
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h1>Bài viết không tìm thấy</h1>
        <a href="/blog">← Quay lại blog</a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <a href="/blog" style={{ color: '#10B981', textDecoration: 'none', fontSize: 14 }}>
        ← Quay lại danh sách
      </a>

      <article style={{ marginTop: 24 }}>
        <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>
          {post.category || 'Chung'}
        </span>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{post.title}</h1>
        <div style={{ color: '#9CA3AF', fontSize: 13, marginTop: 8 }}>
          {post.author?.fullName || 'Agrix'} · {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
        </div>

        <div
          style={{
            marginTop: 32, lineHeight: 1.8, fontSize: 16,
            color: '#374151',
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}
