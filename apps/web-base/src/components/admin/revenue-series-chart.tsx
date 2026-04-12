"use client";

import { RevenueSeriesPoint } from "@/lib/admin/reporting-types";

type Props = {
  points: RevenueSeriesPoint[];
};

export function RevenueSeriesChart({ points }: Props) {
  const maxRevenue = Math.max(...points.map((point) => point.revenue), 0);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Doanh thu theo ky</h2>
        <p className="text-sm text-muted-foreground">
          Theo doi xu huong doanh thu tren cung bo loc bao cao
        </p>
      </div>

      {points.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Chua co du lieu doanh thu cho ky da chon
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
                      {point.orderCount} don
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
