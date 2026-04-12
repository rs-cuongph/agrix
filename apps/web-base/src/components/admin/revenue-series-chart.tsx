"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevenueSeriesPoint } from "@/lib/admin/reporting-types";

type Props = {
  points: RevenueSeriesPoint[];
};

export function RevenueSeriesChart({ points }: Props) {
  const maxRevenue = Math.max(...points.map((point) => point.revenue), 0);

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Doanh thu theo kỳ</CardTitle>
        <CardDescription>
          Theo dõi xu hướng doanh thu trên cùng bộ lọc báo cáo.
        </CardDescription>
      </CardHeader>
      <CardContent>
      {points.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu doanh thu cho kỳ đã chọn.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid h-64 grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
            {points.map((point) => {
              const height =
                maxRevenue > 0 ? Math.max((point.revenue / maxRevenue) * 100, 8) : 8;

              return (
                <div
                  key={point.bucketStart}
                  className="flex min-w-0 flex-col justify-end gap-2 rounded-lg border bg-muted/30 p-3"
                >
                  <div className="flex h-full items-end">
                    <div
                      className="w-full rounded-md bg-emerald-500/85 transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {point.bucketLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {point.revenue.toLocaleString("vi-VN")}đ
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {point.orderCount} đơn
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </CardContent>
    </Card>
  );
}
