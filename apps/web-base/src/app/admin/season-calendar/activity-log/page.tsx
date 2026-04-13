"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Activity, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchActivityLog, type ActivityLogItem } from "@/lib/admin/season-calendar-api";

const ACTION_ICON = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
} as const;

export default function SeasonCalendarActivityLogPage() {
  const [items, setItems] = useState<ActivityLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (nextPage: number, reset = false) => {
    setLoading(true);
    try {
      const response = await fetchActivityLog({
        page: nextPage,
        limit: 20,
        entityType,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      setItems((current) => (reset ? response.items : [...current, ...response.items]));
      setPage(response.page);
      setHasMore(response.page * response.limit < response.total);
    } finally {
      setLoading(false);
    }
  }, [entityType, fromDate, toDate]);

  useEffect(() => {
    void loadPage(1, true);
  }, [loadPage]);

  useEffect(() => {
    if (!anchorRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        void loadPage(page + 1);
      }
    });
    observer.observe(anchorRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadPage, loading, page]);

  const title = useMemo(() => {
    if (!items.length && !loading) {
      return "Chưa có hoạt động nào được ghi nhận";
    }
    return `Đang hiển thị ${items.length} hoạt động`;
  }, [items.length, loading]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_40%,#ecfeff_100%)] p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-700">
          <Activity className="h-3.5 w-3.5" />
          Activity Log
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          Nhật ký hoạt động
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Theo dõi thay đổi vùng, cây trồng, lịch mùa vụ, sâu bệnh và dữ liệu thời tiết trong 6 tháng gần nhất.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Loại thực thể" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="zone">zone</SelectItem>
              <SelectItem value="crop">crop</SelectItem>
              <SelectItem value="calendar">calendar</SelectItem>
              <SelectItem value="stage">stage</SelectItem>
              <SelectItem value="recommendation">recommendation</SelectItem>
              <SelectItem value="pest_warning">pest_warning</SelectItem>
              <SelectItem value="weather">weather</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && items.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border p-4">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="mt-3 h-4 w-40" />
                </div>
              ))
            : null}

          {!items.length && !loading ? (
            <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
              Chưa có hoạt động nào được ghi nhận.
            </div>
          ) : null}

          {items.map((item) => {
            const Icon = ACTION_ICON[item.action];
            return (
              <div key={item.id} className="flex gap-4 rounded-2xl border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Icon className="h-4 w-4 text-slate-700" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{item.actorName}</span>
                    <Badge variant="outline">{item.entityType}</Badge>
                    <Badge
                      className={
                        item.action === "create"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.action === "update"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-rose-100 text-rose-700"
                      }
                    >
                      {item.action}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-700">
                    {item.entityName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={anchorRef} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
}
