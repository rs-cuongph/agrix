"use client";

import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeatherMonth } from "@/lib/admin/season-calendar-api";

type WeatherOverlayProps = {
  weatherData: WeatherMonth[];
  loading?: boolean;
  zoneName?: string;
};

export function WeatherOverlay({
  weatherData,
  loading = false,
  zoneName,
}: WeatherOverlayProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!weatherData.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Chưa có dữ liệu khí hậu cho vùng này.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-2 text-sm font-medium">Dữ liệu thời tiết trung bình</div>
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={weatherData}>
            <XAxis dataKey="month" tickFormatter={(value) => `T${value}`} />
            <YAxis yAxisId="rain" hide />
            <YAxis yAxisId="temp" hide orientation="right" />
            <Tooltip
              formatter={(value, name) =>
                name === "avgRainfallMm"
                  ? [`${value ?? 0} mm`, "Lượng mưa"]
                  : [`${value ?? 0} °C`, "Nhiệt độ"]
              }
              labelFormatter={(label) =>
                `T${label}${zoneName ? ` — ${zoneName}` : ""}`
              }
            />
            <Bar
              yAxisId="rain"
              dataKey="avgRainfallMm"
              fill="#60a5fa"
              radius={[6, 6, 0, 0]}
              maxBarSize={16}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="avgTempC"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
