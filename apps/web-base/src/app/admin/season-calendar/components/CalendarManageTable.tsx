"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CalendarListItem } from "@/lib/admin/season-calendar-admin-api";
import type { SeasonCrop, SeasonZone } from "@/lib/admin/season-calendar-api";

type CalendarManageTableProps = {
  items: CalendarListItem[];
  loading: boolean;
  zoneOptions: SeasonZone[];
  cropOptions: SeasonCrop[];
  zoneFilter: string;
  cropFilter: string;
  onZoneFilterChange: (value: string) => void;
  onCropFilterChange: (value: string) => void;
  onRowClick: (id: string) => void;
  onEdit: (item: CalendarListItem) => void;
  onDelete: (item: CalendarListItem) => void;
};

export function CalendarManageTable({
  items,
  loading,
  zoneOptions,
  cropOptions,
  zoneFilter,
  cropFilter,
  onZoneFilterChange,
  onCropFilterChange,
  onRowClick,
  onEdit,
  onDelete,
}: CalendarManageTableProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Select value={zoneFilter} onValueChange={onZoneFilterChange}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Lọc theo vùng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vùng</SelectItem>
            {zoneOptions.map((zone) => (
              <SelectItem key={zone.id} value={zone.id}>
                {zone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={cropFilter} onValueChange={onCropFilterChange}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Lọc theo cây trồng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cây trồng</SelectItem>
            {cropOptions.map((crop) => (
              <SelectItem key={crop.id} value={crop.id}>
                {crop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên vụ</TableHead>
              <TableHead>Vùng</TableHead>
              <TableHead>Cây trồng</TableHead>
              <TableHead>Số giai đoạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[120px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={`calendar-skeleton-${index}`}>
                    {Array.from({ length: 7 }, (_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Chưa có mùa vụ nào. Tạo mùa vụ đầu tiên hoặc dùng AI tạo lịch tự động.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => onRowClick(item.id)}
                  >
                    <TableCell className="font-medium">{item.seasonName}</TableCell>
                    <TableCell>
                      {item.zone ? (
                        <Badge variant="outline">{item.zone.name}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{item.crop?.name ?? "-"}</TableCell>
                    <TableCell>{item.stageCount}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                        }
                      >
                        {item.isActive ? "Đang hoạt động" : "Tạm tắt"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(item.createdAt), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(item);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete(item);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
