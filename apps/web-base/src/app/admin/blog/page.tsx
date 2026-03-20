import { apiGet } from "@/lib/api";
import { FileText } from "lucide-react";

type BlogPost = {
  id: string; title: string; author: string; status: string; createdAt: string;
};

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await apiGet<BlogPost[]>("/blog/admin/posts");
  } catch (e) {
    console.error("Blog fetch error:", e);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6" /> Blog
        </h1>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold">Tiêu đề</th>
              <th className="text-left px-4 py-3 font-semibold">Tác giả</th>
              <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
              <th className="text-left px-4 py-3 font-semibold">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.author}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {p.status === "published" ? "Đã xuất bản" : "Nháp"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Chưa có bài viết</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
