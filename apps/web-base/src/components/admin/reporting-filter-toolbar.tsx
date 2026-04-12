"use client";

import * as React from "react";
import { vi } from "react-day-picker/locale";
import type { DateRange } from "react-day-picker";
import { CalendarRange, CalendarIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDisplayDate,
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

function toInputString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseInputDate(str: string): Date | undefined {
  if (!str) return undefined;
  const d = new Date(`${str}T00:00:00`);
  return isNaN(d.getTime()) ? undefined : d;
}

export function ReportingFilterToolbar({
  filter,
  pending = false,
  onChange,
  onRefresh,
}: Props) {
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const fromDate = parseInputDate(filter.from);
  const toDate = parseInputDate(filter.to);

  const selectedRange: DateRange | undefined =
    fromDate || toDate ? { from: fromDate, to: toDate } : undefined;

  // When granularity changes → reset the entire filter to sensible defaults
  const handleGranularityChange = (value: ReportingGranularity) => {
    onChange(getDefaultFilter(value));
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (!range) return;
    const from = range.from ? toInputString(range.from) : filter.from;
    const to = range.to ? toInputString(range.to) : (range.from ? toInputString(range.from) : filter.to);
    onChange({ ...filter, from, to });
    if (range.from && range.to) {
      setCalendarOpen(false);
    }
  };

  const displayLabel = React.useMemo(() => {
    if (!fromDate && !toDate) return "Chọn khoảng thời gian";
    if (fromDate && toDate) {
      const f = formatDisplayDate(filter.from);
      const t = formatDisplayDate(filter.to);
      return filter.from === filter.to ? f : `${f} – ${t}`;
    }
    return fromDate ? formatDisplayDate(filter.from) : "Chọn khoảng thời gian";
  }, [fromDate, toDate, filter.from, filter.to]);

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

          {/* Date range picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Khoảng thời gian</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal"
                >
                  <CalendarIcon data-icon="inline-start" />
                  {displayLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  locale={vi}
                  defaultMonth={fromDate}
                  selected={selectedRange}
                  onSelect={handleRangeSelect}
                  numberOfMonths={filter.granularity === "year" ? 2 : 1}
                  captionLayout={
                    filter.granularity === "month" || filter.granularity === "year"
                      ? "dropdown"
                      : "label"
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Kỳ đang xem: <span className="font-medium text-foreground">{getFilterLabel(filter)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
