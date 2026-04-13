"use client";

import { useEffect, useState } from "react";
import { Leaf, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHero, AdminPanel, AdminStatsGrid } from "@/components/admin/admin-page-shell";
import { CrudDialog } from "@/components/admin/crud-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCrops, type SeasonCrop } from "@/lib/admin/season-calendar-api";
import {
  createCrop,
  deleteCrop,
  updateCrop,
} from "@/lib/admin/season-calendar-admin-api";

const CROP_CATEGORY_OPTIONS = [
  "Lúa gạo",
  "Ngũ cốc",
  "Họ đậu",
  "Rau màu",
  "Cây công nghiệp",
  "Cây ăn trái",
  "Khác",
];

export default function SeasonCalendarCropsPage() {
  const [crops, setCrops] = useState<SeasonCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{
    mode: "create" | "edit";
    data?: SeasonCrop;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setCrops(await fetchCrops());
    } catch {
      toast.error("Không tải được danh sách cây trồng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const fields = [
    { name: "name", label: "Tên cây trồng", required: true },
    {
      name: "category",
      label: "Nhóm cây trồng",
      type: "select" as const,
      options: CROP_CATEGORY_OPTIONS.map((category) => ({
        value: category,
        label: category,
      })),
    },
    {
      name: "imageUrl",
      label: "Ảnh minh họa",
      type: "image-gallery" as const,
      uploadPath: "/products/admin/upload",
    },
    { name: "localNames", label: "Tên địa phương (dấu phẩy phân tách)" },
    { name: "description", label: "Mô tả", type: "textarea" as const },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Crop Catalog"
        icon={Leaf}
        title="Quản lý cây trồng"
        description="Tập trung danh mục cây trồng cho lịch mùa vụ và chatbot trong cùng bộ khung hiển thị với các menu còn lại."
        actions={
          <>
            <Button variant="outline" onClick={() => void load()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button onClick={() => setDialog({ mode: "create" })}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm cây trồng
            </Button>
          </>
        }
      />

      <AdminStatsGrid
        items={[
          { label: "Tổng cây trồng", value: crops.length.toLocaleString("vi-VN"), hint: "trong danh mục mùa vụ", icon: Leaf },
          { label: "Nhóm cây", value: new Set(crops.map((crop) => crop.category ?? "Khác")).size.toLocaleString("vi-VN"), hint: "phân loại hiện có", icon: Plus, accentClassName: "border-sky-100 bg-sky-50 text-sky-600" },
        ]}
      />

      <AdminPanel title="Danh sách cây trồng" description="Quản trị cây trồng, tên địa phương và nhóm phân loại dùng trong lịch mùa vụ.">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Tên cây</th>
                    <th className="px-4 py-3 text-left font-medium">Nhóm</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Tên địa phương
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map((crop) => (
                    <tr key={crop.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{crop.name}</td>
                      <td className="px-4 py-3">{crop.category ?? "Khác"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {(crop.localNames ?? []).map((name) => (
                            <Badge key={name} variant="outline">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDialog({ mode: "edit", data: crop })
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              await deleteCrop(crop.id);
                              toast.success("Đã vô hiệu hóa cây trồng");
                              await load();
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {crops.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Chưa có cây trồng
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
      </AdminPanel>

      {dialog ? (
        <CrudDialog
          title="cây trồng"
          mode={dialog.mode}
          fields={fields}
          initialData={
            dialog.data
              ? {
                  name: dialog.data.name,
                  category: dialog.data.category ?? "Khác",
                  description: dialog.data.description ?? "",
                  imageUrl: dialog.data.imageUrl ? [dialog.data.imageUrl] : [],
                  localNames: dialog.data.localNames?.join(", ") ?? "",
                }
              : {}
          }
          onClose={() => setDialog(null)}
          onSubmit={async (data) => {
            const body = {
              ...data,
              category:
                !data.category || data.category === "Khác"
                  ? null
                  : data.category,
              imageUrl: Array.isArray(data.imageUrl)
                ? (data.imageUrl[0] ?? null)
                : (data.imageUrl ?? null),
              localNames: String(data.localNames || "")
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean),
            };
            if (dialog.mode === "create") {
              await createCrop(body);
              toast.success("Đã tạo cây trồng");
            } else if (dialog.data) {
              await updateCrop(dialog.data.id, body);
              toast.success("Đã cập nhật cây trồng");
            }
            setDialog(null);
            await load();
          }}
        />
      ) : null}
    </div>
  );
}
