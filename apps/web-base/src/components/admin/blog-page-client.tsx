"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, FolderTree, Tag, Plus, Pencil, Trash2, Eye, EyeOff, BookOpenText } from "lucide-react";
import { AdminPageHero, AdminPanel, AdminStatsGrid } from "@/components/admin/admin-page-shell";
import { BlogCategoriesClient } from "@/components/admin/blog-categories-client";
import { BlogTagsClient } from "@/components/admin/blog-tags-client";
import { adminApiCall } from "@/components/admin/crud-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteId) return;
    await adminApiCall(`/blog/admin/posts/${deleteId}`, "DELETE");
    toast.success("Xóa bài viết thành công");
    setDeleteId(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Content Hub"
        icon={BookOpenText}
        title="Quản lý blog"
        description="Đồng bộ khu vực nội dung với phần mùa vụ bằng hero rõ trọng tâm, số liệu nhanh và tabs có cùng nhịp tương tác."
        actions={
          <button
            onClick={() => router.push("/admin/blog/new")}
            className="inline-flex items-center gap-1 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" /> Tạo bài viết
          </button>
        }
      />

      <AdminStatsGrid
        items={[
          { label: "Bài viết", value: posts.length.toLocaleString("vi-VN"), hint: "toàn bộ nội dung", icon: FileText },
          { label: "Đã xuất bản", value: posts.filter((post) => post.status === "PUBLISHED").length.toLocaleString("vi-VN"), hint: "đang hiển thị ngoài website", icon: Eye, accentClassName: "border-emerald-100 bg-emerald-50 text-emerald-600" },
          { label: "Danh mục", value: categories.length.toLocaleString("vi-VN"), hint: "nhóm nội dung", icon: FolderTree, accentClassName: "border-sky-100 bg-sky-50 text-sky-600" },
          { label: "Tags", value: tags.length.toLocaleString("vi-VN"), hint: "hỗ trợ điều hướng nội dung", icon: Tag, accentClassName: "border-amber-100 bg-amber-50 text-amber-600" },
        ]}
      />

      <Tabs defaultValue="posts" className="space-y-5">
        <TabsList className="w-full justify-start rounded-2xl border border-slate-200/80 bg-white/85 p-1.5 shadow-sm">
          <TabsTrigger value="posts" className="flex items-center gap-1.5 rounded-xl px-4 py-2.5">
            <FileText className="w-4 h-4" /> Bài viết
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-1.5 rounded-xl px-4 py-2.5">
            <FolderTree className="w-4 h-4" /> Danh mục
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-1.5 rounded-xl px-4 py-2.5">
            <Tag className="w-4 h-4" /> Tags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <AdminPanel title="Danh sách bài viết" description="Quản trị tiêu đề, trạng thái xuất bản và chỉnh sửa nhanh từ bảng.">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/90 text-left">
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
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
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
          </AdminPanel>
        </TabsContent>

        <TabsContent value="categories">
          <BlogCategoriesClient categories={categories} />
        </TabsContent>
        <TabsContent value="tags">
          <BlogTagsClient tags={tags} />
        </TabsContent>
      </Tabs>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        description="Xóa bài viết này?"
      />
    </div>
  );
}
