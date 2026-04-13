"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarFormDialog } from "../../components/CalendarFormDialog";
import { StageFormDialog } from "../../components/StageFormDialog";
import { StageListAccordion } from "../../components/StageListAccordion";
import { getCalendarDetail, type CalendarDetail } from "@/lib/admin/season-calendar-admin-api";

export default function SeasonCalendarManageDetailPage() {
  const params = useParams<{ id: string }>();
  const calendarId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [calendar, setCalendar] = useState<CalendarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);

  const loadCalendar = useCallback(async () => {
    if (!calendarId) {
      return;
    }

    setLoading(true);
    try {
      setCalendar(await getCalendarDetail(calendarId));
    } catch {
      toast.error("Không tải được chi tiết mùa vụ");
    } finally {
      setLoading(false);
    }
  }, [calendarId]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
        Không tìm thấy mùa vụ cần quản lý.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/season-calendar/manage"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quản lý Mùa vụ
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">{calendar.seasonName}</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý giai đoạn sinh trưởng, sản phẩm gợi ý và cảnh báo sâu bệnh.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Thông tin mùa vụ</CardTitle>
          </div>
          <Button type="button" variant="outline" onClick={() => setCalendarDialogOpen(true)}>
            Chỉnh sửa mùa vụ
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Vùng</div>
            <div className="font-medium">{calendar.zone?.name ?? "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Cây trồng</div>
            <div className="font-medium">{calendar.crop?.name ?? "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Trạng thái</div>
            <div className="font-medium">
              {calendar.isActive ? "Đang hoạt động" : "Tạm tắt"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Ghi chú</div>
            <div className="font-medium">{calendar.notes || "Không có ghi chú"}</div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Giai đoạn sinh trưởng</h2>
            <p className="text-sm text-muted-foreground">
              Quản lý toàn bộ stage, recommendation và pest warning trong mùa vụ này.
            </p>
          </div>
          <Button type="button" onClick={() => setStageDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm giai đoạn
          </Button>
        </div>

        <StageListAccordion
          calendarId={calendar.id}
          stages={calendar.stages}
          onRefresh={loadCalendar}
        />
      </section>

      <CalendarFormDialog
        open={calendarDialogOpen}
        onOpenChange={setCalendarDialogOpen}
        initialData={calendar}
        onSuccess={loadCalendar}
      />

      <StageFormDialog
        open={stageDialogOpen}
        onOpenChange={setStageDialogOpen}
        calendarId={calendar.id}
        onSuccess={loadCalendar}
      />
    </div>
  );
}
