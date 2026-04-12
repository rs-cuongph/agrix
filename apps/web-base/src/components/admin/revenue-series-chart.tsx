"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ReportingGranularity, RevenueSeriesPoint } from "@/lib/admin/reporting-types";

type Props = {
  points: RevenueSeriesPoint[];
  granularity: ReportingGranularity;
};

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function formatRevenue(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return `${value}đ`;
}

const tooltipFormatter: React.ComponentProps<typeof ChartTooltipContent>["formatter"] =
  (value, name) => {
    if (name === "revenue") {
      return (
        <span className="font-mono font-medium tabular-nums">
          {Number(value).toLocaleString("vi-VN")}đ
        </span>
      );
    }
    return <span className="font-mono font-medium tabular-nums">{value}</span>;
  };

export function RevenueSeriesChart({ points, granularity }: Props) {
  const useAreaChart = granularity === "day" || granularity === "week";

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
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Chưa có dữ liệu doanh thu cho kỳ đã chọn.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            {useAreaChart ? (
              <AreaChart
                data={points}
                accessibilityLayer
                margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="bucketLabel"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatRevenue}
                  width={52}
                />
                <ChartTooltip
                  cursor={{ stroke: "var(--color-revenue)", strokeOpacity: 0.3 }}
                  content={<ChartTooltipContent formatter={tooltipFormatter} />}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={points}
                accessibilityLayer
                margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="bucketLabel"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatRevenue}
                  width={52}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent formatter={tooltipFormatter} />}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={56}
                />
              </BarChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
