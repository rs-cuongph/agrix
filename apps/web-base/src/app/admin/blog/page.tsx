import { apiGet } from "@/lib/api";
import { BlogClient } from "@/components/admin/blog-client";

type BlogPost = {
  id: string; title: string; slug: string; status: string;
  content?: string; createdAt: string;
};

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await apiGet<BlogPost[]>("/blog/admin/posts");
  } catch (e) {
    console.error("Blog fetch error:", e);
  }

  return <BlogClient posts={posts} />;
}
