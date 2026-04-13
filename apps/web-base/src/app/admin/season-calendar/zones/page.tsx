"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CrudDialog } from "@/components/admin/crud-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchZones, type SeasonZone } from "@/lib/admin/season-calendar-api";
import {
  createZone,
  deleteZone,
  updateZone,
} from "@/lib/admin/season-calendar-admin-api";

export default function SeasonCalendarZonesPage() {
  const [zones, setZones] = useState<SeasonZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{
    mode: "create" | "edit";
    data?: SeasonZone;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setZones(await fetchZones());
    } catch {
      toast.error("Không tải được danh sách vùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const fields = [
    { name: "name", label: "Tên vùng", required: true },
    { name: "code", label: "Mã vùng", required: true },
    { name: "description", label: "Mô tả", type: "textarea" as const },
    {
      name: "provinces",
      label: "Tỉnh/thành (phân tách bằng dấu phẩy)",
      placeholder: "Cần Thơ, An Giang, Kiên Giang",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý vùng nông nghiệp</h1>
          <p className="text-sm text-muted-foreground">
            Thêm, cập nhật và vô hiệu hóa các vùng áp dụng lịch mùa vụ.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button onClick={() => setDialog({ mode: "create" })}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm vùng
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách vùng</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">
                      Tên vùng
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Mã vùng</th>
                    <th className="px-4 py-3 text-left font-medium">Số tỉnh</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => (
                    <tr key={zone.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{zone.name}</td>
                      <td className="px-4 py-3">{zone.code}</td>
                      <td className="px-4 py-3">
                        {zone.provinces?.length ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDialog({ mode: "edit", data: zone })
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              await deleteZone(zone.id);
                              toast.success("Đã vô hiệu hóa vùng");
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
                  {zones.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Chưa có vùng nông nghiệp
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {dialog ? (
        <CrudDialog
          title="vùng nông nghiệp"
          mode={dialog.mode}
          fields={fields}
          initialData={
            dialog.data
              ? {
                  name: dialog.data.name,
                  code: dialog.data.code,
                  description: dialog.data.description ?? "",
                  provinces: dialog.data.provinces?.join(", ") ?? "",
                }
              : {}
          }
          onClose={() => setDialog(null)}
          onSubmit={async (data) => {
            const body = {
              ...data,
              provinces: String(data.provinces || "")
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean),
            };
            if (dialog.mode === "create") {
              await createZone(body);
              toast.success("Đã tạo vùng mới");
            } else if (dialog.data) {
              await updateZone(dialog.data.id, body);
              toast.success("Đã cập nhật vùng");
            }
            setDialog(null);
            await load();
          }}
        />
      ) : null}
    </div>
  );
}
