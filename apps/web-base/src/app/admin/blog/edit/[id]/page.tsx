import { apiGet } from "@/lib/api";
import { BlogEditorPage } from "@/components/admin/blog-editor-page";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let post: any = null;
  let categories: any[] = [];
  let tags: any[] = [];
  let linkedProducts: any[] = [];

  try {
    [post, categories, tags] = await Promise.all([
      apiGet<any>(`/blog/admin/posts/${id}`),
      apiGet<any[]>("/blog/admin/categories"),
      apiGet<any[]>("/blog/admin/tags"),
    ]);
    linkedProducts = post?.linkedProducts || [];
  } catch { /* fallback */ }

  if (!post) return <div className="p-6">Bài viết không tồn tại</div>;

  return (
    <BlogEditorPage
      postId={id}
      initialData={post}
      categories={categories}
      tags={tags}
      linkedProducts={linkedProducts}
    />
  );
}
