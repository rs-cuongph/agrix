"use client";

import * as React from "react";
import { vi } from "react-day-picker/locale";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/admin/reporting-filters";
import { ReportingFilter } from "@/lib/admin/reporting-types";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

/** Monday of the week containing `date` (Monday-based week) */
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

/** Sunday of the week containing `date` */
function endOfWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  return d;
}

const MONTH_NAMES = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

type PickerProps = {
  filter: ReportingFilter;
  onChange: (next: ReportingFilter) => void;
};

// ── Day Range Picker ──────────────────────────────────────────────────────────

function DayRangePicker({ filter, onChange }: PickerProps) {
  const [open, setOpen] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(new Date());
  // Local selection state — always starts undefined on open so react-day-picker
  // treats click 1 as "set from" and click 2 as "set to" (native v9 range UX).
  const [selection, setSelection] = React.useState<DateRange | undefined>(undefined);

  const fromDate = parseInputDate(filter.from);
  const toDate = parseInputDate(filter.to);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setSelection(undefined);
      setCalendarMonth(fromDate ?? new Date());
    }
    setOpen(next);
  };

  const label =
    fromDate && toDate
      ? filter.from === filter.to
        ? formatDisplayDate(filter.from)
        : `${formatDisplayDate(filter.from)} – ${formatDisplayDate(filter.to)}`
      : "Chọn khoảng ngày";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
          <CalendarIcon data-icon="inline-start" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          locale={vi}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          selected={selection}
          onSelect={(range) => {
            setSelection(range ?? undefined);
            if (range?.from && range?.to) {
              onChange({
                ...filter,
                from: toInputString(range.from),
                to: toInputString(range.to),
              });
              setOpen(false);
            }
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// ── Week Picker ───────────────────────────────────────────────────────────────

function WeekPicker({ filter, onChange }: PickerProps) {
  const [open, setOpen] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(new Date());

  const fromDate = parseInputDate(filter.from);
  const toDate = parseInputDate(filter.to);

  const handleOpenChange = (next: boolean) => {
    if (next) setCalendarMonth(fromDate ?? new Date());
    setOpen(next);
  };

  const label =
    fromDate && toDate
      ? `${formatDisplayDate(filter.from)} – ${formatDisplayDate(filter.to)}`
      : "Chọn tuần";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
          <CalendarIcon data-icon="inline-start" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <p className="px-3 pt-3 pb-0 text-xs text-center text-muted-foreground">
          Nhấn vào ngày bất kỳ để chọn cả tuần
        </p>
        <Calendar
          mode="range"
          locale={vi}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          selected={fromDate && toDate ? { from: fromDate, to: toDate } : undefined}
          onSelect={(range) => {
            // Snap any clicked day to its full Mon–Sun week
            const anchor = range?.from;
            if (!anchor) return;
            const from = startOfWeek(anchor);
            const to = endOfWeek(anchor);
            onChange({ ...filter, from: toInputString(from), to: toInputString(to) });
            setOpen(false);
          }}
          showWeekNumber
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// ── Month Range Picker ────────────────────────────────────────────────────────

function MonthRangePicker({ filter, onChange }: PickerProps) {
  const [open, setOpen] = React.useState(false);

  const fromDate = parseInputDate(filter.from);
  const toDate = parseInputDate(filter.to);

  const fromY = fromDate?.getFullYear() ?? new Date().getFullYear();
  const fromM = fromDate?.getMonth(); // 0-indexed
  const toY = toDate?.getFullYear() ?? new Date().getFullYear();
  const toM = toDate?.getMonth();

  const [year, setYear] = React.useState(fromY);
  const [anchor, setAnchor] = React.useState<{ year: number; month: number } | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (next) { setYear(fromY); setAnchor(null); }
    setOpen(next);
  };

  const handleMonthClick = (m: number) => {
    if (!anchor) {
      setAnchor({ year, month: m });
    } else {
      let [aY, aM, bY, bM] = [anchor.year, anchor.month, year, m];
      if (bY < aY || (bY === aY && bM < aM)) [aY, aM, bY, bM] = [bY, bM, aY, aM];
      const from = new Date(aY, aM, 1);
      const to = new Date(bY, bM + 1, 0); // last day of toMonth
      onChange({ ...filter, from: toInputString(from), to: toInputString(to) });
      setOpen(false);
      setAnchor(null);
    }
  };

  const cellState = (m: number): "selected" | "in-range" | "anchor" | "none" => {
    const ym = year * 12 + m;
    if (anchor) {
      const aYM = anchor.year * 12 + anchor.month;
      if (ym === aYM) return "anchor";
      return "none";
    }
    if (fromM === undefined || toM === undefined) return "none";
    const start = fromY * 12 + fromM;
    const end = toY * 12 + toM;
    if (ym === start || ym === end) return "selected";
    if (ym > start && ym < end) return "in-range";
    return "none";
  };

  const label =
    fromDate && toDate
      ? fromY === toY && fromM === toM
        ? `T${(fromM ?? 0) + 1}/${fromY}`
        : `T${(fromM ?? 0) + 1}/${fromY} – T${(toM ?? 0) + 1}/${toY}`
      : "Chọn tháng";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
          <CalendarIcon data-icon="inline-start" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="flex flex-col gap-3">
          {/* Year navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setYear((y) => y - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium">{year}</span>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setYear((y) => y + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {MONTH_NAMES.map((name, idx) => {
              const state = cellState(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleMonthClick(idx)}
                  className={cn(
                    "rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent",
                    state === "selected" && "bg-primary text-primary-foreground hover:bg-primary/90",
                    state === "anchor" && "bg-primary text-primary-foreground hover:bg-primary/90",
                    state === "in-range" && "bg-primary/15 rounded-none",
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {anchor && (
            <p className="text-xs text-center text-muted-foreground">
              Chọn tháng kết thúc…
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Year Range Picker ─────────────────────────────────────────────────────────

function YearRangePicker({ filter, onChange }: PickerProps) {
  const [open, setOpen] = React.useState(false);
  const currentYear = new Date().getFullYear();

  const fromDate = parseInputDate(filter.from);
  const toDate = parseInputDate(filter.to);

  const fromY = fromDate?.getFullYear();
  const toY = toDate?.getFullYear();

  const [base, setBase] = React.useState(() =>
    Math.max((fromY ?? currentYear) - 4, currentYear - 8),
  );
  const [anchor, setAnchor] = React.useState<number | null>(null);

  const years = Array.from({ length: 12 }, (_, i) => base + i);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setBase(Math.max((fromY ?? currentYear) - 4, currentYear - 8));
      setAnchor(null);
    }
    setOpen(next);
  };

  const handleYearClick = (y: number) => {
    if (!anchor) {
      setAnchor(y);
    } else {
      const minY = Math.min(anchor, y);
      const maxY = Math.max(anchor, y);
      const from = new Date(minY, 0, 1);
      const to = new Date(maxY, 11, 31);
      onChange({ ...filter, from: toInputString(from), to: toInputString(to) });
      setOpen(false);
      setAnchor(null);
    }
  };

  const cellState = (y: number): "selected" | "in-range" | "anchor" | "current" | "none" => {
    if (anchor !== null) return y === anchor ? "anchor" : "none";
    if (fromY === undefined || toY === undefined) return y === currentYear ? "current" : "none";
    if (y === fromY || y === toY) return "selected";
    if (y > fromY && y < toY) return "in-range";
    if (y === currentYear) return "current";
    return "none";
  };

  const label =
    fromY && toY
      ? fromY === toY
        ? `${fromY}`
        : `${fromY} – ${toY}`
      : "Chọn năm";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
          <CalendarIcon data-icon="inline-start" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="flex flex-col gap-3">
          {/* Page navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setBase((b) => b - 12)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium">{base} – {base + 11}</span>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setBase((b) => b + 12)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Year grid */}
          <div className="grid grid-cols-3 gap-1">
            {years.map((y) => {
              const state = cellState(y);
              return (
                <button
                  key={y}
                  onClick={() => handleYearClick(y)}
                  className={cn(
                    "rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent",
                    state === "selected" && "bg-primary text-primary-foreground hover:bg-primary/90",
                    state === "anchor" && "bg-primary text-primary-foreground hover:bg-primary/90",
                    state === "in-range" && "bg-primary/15 rounded-none",
                    state === "current" && "font-semibold",
                  )}
                >
                  {y}
                </button>
              );
            })}
          </div>

          {anchor !== null && (
            <p className="text-xs text-center text-muted-foreground">
              Chọn năm kết thúc…
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function GranularityDatePicker(props: PickerProps) {
  switch (props.filter.granularity) {
    case "day":   return <DayRangePicker {...props} />;
    case "week":  return <WeekPicker {...props} />;
    case "month": return <MonthRangePicker {...props} />;
    case "year":  return <YearRangePicker {...props} />;
  }
}
