"use client";

import { useRouter } from "next/navigation";
import { FileText, FolderTree, Tag, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { BlogCategoriesClient } from "@/components/admin/blog-categories-client";
import { BlogTagsClient } from "@/components/admin/blog-tags-client";
import { adminApiCall } from "@/components/admin/crud-dialog";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type BlogPost = {
  id: string; title: string; slug: string; status: string;
  createdAt: string; category?: { name: string };
  tags?: { name: string }[];
};

export function BlogPageClient({
  posts,
  categories,
  tags,
}: {
  posts: BlogPost[];
  categories: any[];
  tags: any[];
}) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bài viết này?")) return;
    await adminApiCall(`/blog/admin/posts/${id}`, "DELETE");
    toast.success("Xóa bài viết thành công");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
        <button
          onClick={() => router.push("/admin/blog/new")}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
        >
          <Plus className="w-4 h-4" /> Tạo bài viết
        </button>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts" className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Bài viết
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-1.5">
            <FolderTree className="w-4 h-4" /> Danh mục
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-1.5">
            <Tag className="w-4 h-4" /> Tags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold">Tiêu đề</th>
                  <th className="px-4 py-3 font-semibold">Danh mục</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                  <th className="px-4 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3">
                      {p.status === "PUBLISHED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full">
                          <Eye className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          <EyeOff className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <button onClick={() => router.push(`/admin/blog/edit/${p.id}`)} className="p-1.5 rounded hover:bg-gray-100">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!posts.length && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Chưa có bài viết</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <BlogCategoriesClient categories={categories} />
        </TabsContent>
        <TabsContent value="tags">
          <BlogTagsClient tags={tags} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
