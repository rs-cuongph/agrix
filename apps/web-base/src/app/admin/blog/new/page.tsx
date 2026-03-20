import { apiGet } from "@/lib/api";
import { BlogEditorPage } from "@/components/admin/blog-editor-page";

export default async function NewBlogPostPage() {
  let categories: any[] = [];
  let tags: any[] = [];

  try {
    [categories, tags] = await Promise.all([
      apiGet<any[]>("/blog/admin/categories"),
      apiGet<any[]>("/blog/admin/tags"),
    ]);
  } catch { /* default empty */ }

  return (
    <BlogEditorPage
      categories={categories}
      tags={tags}
    />
  );
}
