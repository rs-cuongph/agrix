"use client";

import * as React from "react";
import { CalendarRange, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GranularityDatePicker } from "@/components/admin/granularity-date-picker";
import {
  getDefaultFilter,
  getFilterLabel,
  getGranularityLabel,
} from "@/lib/admin/reporting-filters";
import { ReportingFilter, ReportingGranularity } from "@/lib/admin/reporting-types";

type Props = {
  filter: ReportingFilter;
  pending?: boolean;
  onChange: (next: ReportingFilter) => void;
  onRefresh: () => void;
};

export function ReportingFilterToolbar({
  filter,
  pending = false,
  onChange,
  onRefresh,
}: Props) {
  // When granularity changes → reset from/to to sensible defaults for that period
  const handleGranularityChange = (value: ReportingGranularity) => {
    onChange(getDefaultFilter(value));
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="gap-3 lg:flex lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            Bộ lọc báo cáo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Áp dụng một bộ lọc chung cho toàn bộ biểu đồ, bảng xếp hạng và báo cáo xuất ra.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
            <CalendarRange className="size-4" />
            {getGranularityLabel(filter.granularity)}
          </div>
          <Button variant="outline" onClick={onRefresh} disabled={pending}>
            <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
          {/* Granularity selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Chu kỳ</label>
            <Select
              value={filter.granularity}
              onValueChange={(value) =>
                handleGranularityChange(value as ReportingGranularity)
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Chọn chu kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Ngày</SelectItem>
                <SelectItem value="week">Tuần</SelectItem>
                <SelectItem value="month">Tháng</SelectItem>
                <SelectItem value="year">Năm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Smart date picker — changes UI based on granularity */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Khoảng thời gian</label>
            <GranularityDatePicker filter={filter} onChange={onChange} />
          </div>
        </div>

        <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Kỳ đang xem:{" "}
          <span className="font-medium text-foreground">{getFilterLabel(filter)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
