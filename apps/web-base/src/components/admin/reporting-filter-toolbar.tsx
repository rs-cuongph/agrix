"use client";

import { CalendarRange, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const update = (patch: Partial<ReportingFilter>) => onChange({ ...filter, ...patch });

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Chu ky</p>
            <Select
              value={filter.granularity}
              onValueChange={(value) =>
                update({ granularity: value as ReportingGranularity })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chon chu ky" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Ngay</SelectItem>
                <SelectItem value="week">Tuan</SelectItem>
                <SelectItem value="month">Thang</SelectItem>
                <SelectItem value="year">Nam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Tu ngay</p>
            <Input
              type="date"
              value={filter.from}
              onChange={(event) => update({ from: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Den ngay</p>
            <Input
              type="date"
              value={filter.to}
              onChange={(event) => update({ to: event.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
            <CalendarRange className="size-4" />
            Ky bao cao
          </div>
          <Button variant="outline" onClick={onRefresh} disabled={pending}>
            <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
            Lam moi
          </Button>
        </div>
      </div>
    </div>
  );
}
