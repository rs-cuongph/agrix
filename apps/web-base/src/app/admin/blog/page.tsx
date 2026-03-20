import { apiGet } from "@/lib/api";
import { BlogPageClient } from "@/components/admin/blog-page-client";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let posts: any[] = [];
  let categories: any[] = [];
  let tags: any[] = [];

  try {
    [posts, categories, tags] = await Promise.all([
      apiGet<any[]>("/blog/admin/posts"),
      apiGet<any[]>("/blog/admin/categories"),
      apiGet<any[]>("/blog/admin/tags"),
    ]);
  } catch (e) {
    console.error("Blog fetch error:", e);
  }

  return (
    <BlogPageClient posts={posts} categories={categories} tags={tags} />
  );
}
