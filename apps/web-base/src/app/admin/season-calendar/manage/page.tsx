"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarFormDialog } from "../components/CalendarFormDialog";
import { CalendarManageTable } from "../components/CalendarManageTable";
import { AiGenerateDialog } from "../components/AiGenerateDialog";
import {
  deleteCalendar,
  listCalendars,
  type CalendarListItem,
} from "@/lib/admin/season-calendar-admin-api";
import {
  fetchCrops,
  fetchZones,
  type SeasonCrop,
  type SeasonZone,
} from "@/lib/admin/season-calendar-api";

export default function SeasonCalendarManagePage() {
  const router = useRouter();
  const [items, setItems] = useState<CalendarListItem[]>([]);
  const [zones, setZones] = useState<SeasonZone[]>([]);
  const [crops, setCrops] = useState<SeasonCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneFilter, setZoneFilter] = useState("all");
  const [cropFilter, setCropFilter] = useState("all");
  const [dialogTarget, setDialogTarget] = useState<CalendarListItem | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CalendarListItem | null>(null);

  const loadOptions = useCallback(async () => {
    const [zoneData, cropData] = await Promise.all([fetchZones(), fetchCrops()]);
    setZones(zoneData);
    setCrops(cropData);
  }, []);

  const loadCalendars = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listCalendars({
        zoneId: zoneFilter,
        cropId: cropFilter,
      });
      setItems(response.items);
    } catch {
      toast.error("Không tải được danh sách mùa vụ");
    } finally {
      setLoading(false);
    }
  }, [cropFilter, zoneFilter]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    void loadCalendars();
  }, [loadCalendars]);

  const editInitialData = useMemo(() => {
    if (!dialogTarget) {
      return null;
    }
    return {
      id: dialogTarget.id,
      seasonName: dialogTarget.seasonName,
      notes: dialogTarget.notes,
      isActive: dialogTarget.isActive,
      zone: dialogTarget.zone,
      crop: dialogTarget.crop,
      stages: [],
      createdAt: dialogTarget.createdAt,
    };
  }, [dialogTarget]);

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }
    await deleteCalendar(deleteTarget.id);
    toast.success("Đã xóa mùa vụ");
    setDeleteTarget(null);
    await loadCalendars();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border bg-[linear-gradient(135deg,#f7fee7_0%,#ffffff_55%,#eff6ff_100%)] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-emerald-700">
              <Database className="h-3.5 w-3.5" />
              Admin Data
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Quản lý Mùa vụ
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Theo dõi tất cả mùa vụ, lọc theo vùng và cây trồng, rồi đi vào từng lịch để
                quản lý giai đoạn, sản phẩm gợi ý và cảnh báo sâu bệnh.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm mùa vụ
            </Button>
            <AiGenerateDialog onSuccess={loadCalendars} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách mùa vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarManageTable
            items={items}
            loading={loading}
            zoneOptions={zones}
            cropOptions={crops}
            zoneFilter={zoneFilter}
            cropFilter={cropFilter}
            onZoneFilterChange={setZoneFilter}
            onCropFilterChange={setCropFilter}
            onRowClick={(id) => router.push(`/admin/season-calendar/manage/${id}`)}
            onEdit={setDialogTarget}
            onDelete={setDeleteTarget}
          />
        </CardContent>
      </Card>

      <CalendarFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadCalendars}
      />

      <CalendarFormDialog
        open={Boolean(dialogTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDialogTarget(null);
          }
        }}
        initialData={editInitialData}
        onSuccess={loadCalendars}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mùa vụ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa {deleteTarget?.seasonName ?? "mùa vụ này"}. Các giai đoạn, sản phẩm
              gợi ý và cảnh báo sâu bệnh liên quan cũng sẽ bị xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()}>
              Xóa mùa vụ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
