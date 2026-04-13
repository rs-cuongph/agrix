"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SeasonZone } from "@/lib/admin/season-calendar-api";

export function ZoneSelector({
  zones,
  value,
  onChange,
}: {
  zones: SeasonZone[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder="Chọn vùng nông nghiệp" />
      </SelectTrigger>
      <SelectContent>
        {zones.map((zone) => (
          <SelectItem key={zone.id} value={zone.id}>
            {zone.name}
            {zone.provinces?.length ? ` (${zone.provinces.length} tỉnh)` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
