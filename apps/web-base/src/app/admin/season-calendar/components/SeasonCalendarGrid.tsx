"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Leaf, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  addStage,
  createPestWarning,
  deleteCalendar,
  deletePestWarning,
  deleteStage,
  fetchAdminProducts,
  type ProductOption,
  updateCalendar,
  updateStage,
} from "@/lib/admin/season-calendar-admin-api";
import type {
  SeasonCalendarItem,
  SeasonPestWarning,
  SeasonStage,
} from "@/lib/admin/season-calendar-api";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const STAGE_TONE: Record<string, string> = {
  planting: "bg-emerald-100 text-emerald-700 border-emerald-200",
  care: "bg-sky-100 text-sky-700 border-sky-200",
  harvest: "bg-amber-100 text-amber-700 border-amber-200",
};

type SeasonCalendarGridProps = {
  items: SeasonCalendarItem[];
  loading: boolean;
  month: number;
  zoneId: string;
  categories: string[];
  cropFilter: string;
  stageFilter: string;
  filterKeyword: string;
  viewMode: "grid" | "table" | "timeline";
  onCropFilterChange: (value: string) => void;
  onStageFilterChange: (value: string) => void;
  onViewModeChange: (value: "grid" | "table" | "timeline") => void;
  onOpenStage: (value: { calendar: SeasonCalendarItem; stage: SeasonStage }) => void;
  onRefresh: () => Promise<void>;
};

type RecommendationDraft = {
  name: string;
  symptoms: string;
  severity: "low" | "medium" | "high";
  preventionNote: string;
  productId: string;
  usageNote: string;
};

function getDefaultPestWarningDraft(): RecommendationDraft {
  return {
    name: "",
    symptoms: "",
    severity: "medium",
    preventionNote: "",
    productId: "",
    usageNote: "",
  };
}

function stageForMonth(stages: SeasonStage[], month: number): SeasonStage | undefined {
  return stages.find((stage) => {
    if (stage.startMonth <= stage.endMonth) {
      return month >= stage.startMonth && month <= stage.endMonth;
    }
    return month >= stage.startMonth || month <= stage.endMonth;
  });
}

function monthLabel(month: number): string {
  return `T${month}`;
}

function getLocalNameMatch(item: SeasonCalendarItem, keyword: string): string | null {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return (
    item.crop.localNames?.find((name) => name.toLowerCase().includes(normalized)) ?? null
  );
}

export function SeasonCalendarGrid({
  items,
  loading,
  month,
  categories,
  cropFilter,
  stageFilter,
  filterKeyword,
  viewMode,
  onCropFilterChange,
  onStageFilterChange,
  onViewModeChange,
  onOpenStage,
  onRefresh,
}: SeasonCalendarGridProps) {
  const [editCalendarItem, setEditCalendarItem] = useState<SeasonCalendarItem | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [metadataForm, setMetadataForm] = useState({
    seasonName: "",
    year: "",
    notes: "",
  });
  const [newStageForm, setNewStageForm] = useState({
    name: "",
    stageType: "care",
    startMonth: month,
    endMonth: month,
    description: "",
    keywords: "",
    careActivities: "",
    sortOrder: 0,
  });
  const [newPestWarningForms, setNewPestWarningForms] = useState<
    Record<string, RecommendationDraft>
  >({});

  useEffect(() => {
    fetchAdminProducts()
      .then(setProducts)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!editCalendarItem) return;
    setMetadataForm({
      seasonName: editCalendarItem.seasonName,
      year: editCalendarItem.year ? String(editCalendarItem.year) : "",
      notes: editCalendarItem.notes ?? "",
    });
  }, [editCalendarItem]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch =
        cropFilter === "all" || (item.crop.category ?? "Khác") === cropFilter;
      const stageMatch =
        stageFilter === "all" ||
        item.stages.some((stage) => stage.stageType === stageFilter);
      const keywordMatch =
        !filterKeyword ||
        item.crop.name.toLowerCase().includes(filterKeyword.toLowerCase()) ||
        item.crop.localNames?.some((name) =>
          name.toLowerCase().includes(filterKeyword.toLowerCase()),
        );
      return categoryMatch && stageMatch && keywordMatch;
    });
  }, [cropFilter, filterKeyword, items, stageFilter]);

  async function handleSaveMetadata() {
    if (!editCalendarItem) return;
    await updateCalendar(editCalendarItem.id, {
      seasonName: metadataForm.seasonName,
      year: metadataForm.year ? Number(metadataForm.year) : null,
      notes: metadataForm.notes || null,
    });
    toast.success("Đã cập nhật lịch mùa vụ");
    setEditCalendarItem(null);
    await onRefresh();
  }

  async function handleDeleteCalendar(calendarId: string) {
    await deleteCalendar(calendarId);
    toast.success("Đã xóa lịch mùa vụ");
    setEditCalendarItem(null);
    await onRefresh();
  }

  async function handleAddStage() {
    if (!editCalendarItem) return;
    await addStage(editCalendarItem.id, {
      name: newStageForm.name,
      stageType: newStageForm.stageType,
      startMonth: Number(newStageForm.startMonth),
      endMonth: Number(newStageForm.endMonth),
      description: newStageForm.description || undefined,
      keywords: newStageForm.keywords.split(",").map((item) => item.trim()).filter(Boolean),
      careActivities: newStageForm.careActivities
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      sortOrder: Number(newStageForm.sortOrder),
    });
    toast.success("Đã thêm giai đoạn");
    setEditCalendarItem(null);
    await onRefresh();
  }

  async function handleUpdateStage(stage: SeasonStage) {
    await updateStage(stage.id, {
      name: stage.name,
      stageType: stage.stageType,
      startMonth: stage.startMonth,
      endMonth: stage.endMonth,
      description: stage.description || undefined,
      keywords: stage.keywords ?? [],
      careActivities: stage.careActivities ?? [],
      sortOrder: stage.sortOrder,
    });
    toast.success("Đã cập nhật giai đoạn");
    setEditCalendarItem(null);
    await onRefresh();
  }

  async function handleDeleteStage(stageId: string) {
    await deleteStage(stageId);
    toast.success("Đã xóa giai đoạn");
    setEditCalendarItem(null);
    await onRefresh();
  }

  async function handleAddPestWarning(stageId: string) {
    const form = newPestWarningForms[stageId];
    if (!form?.name) return;
    await createPestWarning(stageId, {
      name: form.name,
      symptoms: form.symptoms || undefined,
      severity: form.severity,
      preventionNote: form.preventionNote || undefined,
      treatmentProductIds: form.productId ? [form.productId] : [],
      usageNotes: form.productId ? { [form.productId]: form.usageNote } : undefined,
    });
    toast.success("Đã thêm cảnh báo sâu bệnh");
    setEditCalendarItem(null);
    await onRefresh();
  }

  async function handleDeletePestWarning(warning: SeasonPestWarning) {
    await deletePestWarning(warning.id);
    toast.success("Đã xóa cảnh báo sâu bệnh");
    setEditCalendarItem(null);
    await onRefresh();
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Select value={cropFilter} onValueChange={onCropFilterChange}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Lọc nhóm cây trồng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhóm cây trồng</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={onStageFilterChange}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Lọc giai đoạn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giai đoạn</SelectItem>
              <SelectItem value="planting">Gieo trồng</SelectItem>
              <SelectItem value="care">Chăm sóc</SelectItem>
              <SelectItem value="harvest">Thu hoạch</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-muted p-1">
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => onViewModeChange("grid")}>
            Grid
          </Button>
          <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" onClick={() => onViewModeChange("table")}>
            Table
          </Button>
          <Button variant={viewMode === "timeline" ? "default" : "ghost"} size="sm" onClick={() => onViewModeChange("timeline")}>
            Timeline
          </Button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {filterKeyword
              ? "Không tìm thấy cây trồng phù hợp — thử từ khóa khác."
              : "Chưa có dữ liệu mùa vụ cho vùng này."}
          </CardContent>
        </Card>
      ) : null}

      {viewMode === "grid" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredItems.map((item) => {
            const localNameMatch = getLocalNameMatch(item, filterKeyword);
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="border-b bg-[linear-gradient(135deg,rgba(5,150,105,0.08),rgba(14,165,233,0.04))]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-emerald-600" />
                        {item.crop.name}
                      </CardTitle>
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>
                          {item.seasonName}
                          {item.year ? ` • ${item.year}` : " • Áp dụng hằng năm"}
                        </span>
                        {localNameMatch ? <Badge variant="outline">{localNameMatch}</Badge> : null}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditCalendarItem(item)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-5">
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-12">
                    {MONTHS.map((value) => {
                      const stage = stageForMonth(item.stages, value);
                      const active = value === month;
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={!stage}
                          onClick={() => stage && onOpenStage({ calendar: item, stage })}
                          className={`rounded-xl border px-2 py-3 text-left transition ${
                            stage
                              ? `${STAGE_TONE[stage.stageType]} hover:shadow-sm`
                              : "border-dashed border-muted-foreground/20 bg-muted/30 text-muted-foreground"
                          } ${active ? "ring-2 ring-emerald-500/40" : ""}`}
                        >
                          <div className="text-[11px] uppercase tracking-[0.18em]">{monthLabel(value)}</div>
                          <div className="mt-1 line-clamp-2 text-xs font-medium">{stage?.name ?? "Trống"}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{item.crop.category ?? "Chưa phân loại"}</Badge>
                    {item.currentStage ? (
                      <Badge className={STAGE_TONE[item.currentStage.stageType]}>
                        Hiện tại: {item.currentStage.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Không có giai đoạn trong tháng {month}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cây trồng</TableHead>
                  <TableHead>Vụ</TableHead>
                  <TableHead>Giai đoạn hiện tại</TableHead>
                  {MONTHS.map((value) => (
                    <TableHead key={value}>{monthLabel(value)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const localNameMatch = getLocalNameMatch(item, filterKeyword);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>{item.crop.name}</div>
                        {localNameMatch ? <Badge variant="outline">{localNameMatch}</Badge> : null}
                      </TableCell>
                      <TableCell>{item.seasonName}</TableCell>
                      <TableCell>{item.currentStage?.name ?? "Không có"}</TableCell>
                      {MONTHS.map((value) => {
                        const stage = stageForMonth(item.stages, value);
                        return (
                          <TableCell key={value}>
                            {stage ? (
                              <button
                                type="button"
                                onClick={() => onOpenStage({ calendar: item, stage })}
                                className={`rounded-full border px-2 py-1 text-xs ${STAGE_TONE[stage.stageType]}`}
                              >
                                {stage.name}
                              </button>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={Boolean(editCalendarItem)} onOpenChange={(open) => !open && setEditCalendarItem(null)}>
        <DialogContent className="max-w-4xl">
          {editCalendarItem ? (
            <>
              <DialogHeader>
                <DialogTitle>Chỉnh sửa lịch mùa vụ</DialogTitle>
                <DialogDescription>
                  Cập nhật metadata, giai đoạn sinh trưởng và cảnh báo sâu bệnh cho {editCalendarItem.crop.name}.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seasonName">Tên vụ</Label>
                  <Input id="seasonName" value={metadataForm.seasonName} onChange={(event) => setMetadataForm((prev) => ({ ...prev, seasonName: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Năm</Label>
                  <Input id="year" type="number" value={metadataForm.year} onChange={(event) => setMetadataForm((prev) => ({ ...prev, year: event.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea id="notes" rows={3} value={metadataForm.notes} onChange={(event) => setMetadataForm((prev) => ({ ...prev, notes: event.target.value }))} />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={handleSaveMetadata}>
                  Lưu metadata
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteCalendar(editCalendarItem.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa lịch
                </Button>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-medium">Thêm giai đoạn mới</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input placeholder="Tên giai đoạn" value={newStageForm.name} onChange={(event) => setNewStageForm((prev) => ({ ...prev, name: event.target.value }))} />
                  <Select value={newStageForm.stageType} onValueChange={(value) => setNewStageForm((prev) => ({ ...prev, stageType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planting">Gieo trồng</SelectItem>
                      <SelectItem value="care">Chăm sóc</SelectItem>
                      <SelectItem value="harvest">Thu hoạch</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" min={1} max={12} placeholder="Tháng bắt đầu" value={newStageForm.startMonth} onChange={(event) => setNewStageForm((prev) => ({ ...prev, startMonth: Number(event.target.value) }))} />
                  <Input type="number" min={1} max={12} placeholder="Tháng kết thúc" value={newStageForm.endMonth} onChange={(event) => setNewStageForm((prev) => ({ ...prev, endMonth: Number(event.target.value) }))} />
                  <Input placeholder="Keywords, cách nhau bởi dấu phẩy" value={newStageForm.keywords} onChange={(event) => setNewStageForm((prev) => ({ ...prev, keywords: event.target.value }))} />
                  <Input type="number" placeholder="Thứ tự" value={newStageForm.sortOrder} onChange={(event) => setNewStageForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))} />
                  <div className="md:col-span-2">
                    <Textarea rows={2} placeholder="Mô tả giai đoạn" value={newStageForm.description} onChange={(event) => setNewStageForm((prev) => ({ ...prev, description: event.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea rows={3} placeholder="Checklist chăm sóc, mỗi dòng một mục" value={newStageForm.careActivities} onChange={(event) => setNewStageForm((prev) => ({ ...prev, careActivities: event.target.value }))} />
                  </div>
                </div>
                <Button className="mt-3" onClick={handleAddStage}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm giai đoạn
                </Button>
              </div>

              <Accordion type="single" collapsible className="rounded-2xl border bg-white px-4">
                {editCalendarItem.stages.map((stage) => (
                  <AccordionItem key={stage.id} value={stage.id}>
                    <AccordionTrigger>
                      <div className="flex flex-col gap-1 text-left">
                        <span>{stage.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {monthLabel(stage.startMonth)} - {monthLabel(stage.endMonth)} • {stage.stageType}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input value={stage.name} onChange={(event) => setEditCalendarItem((prev) => prev ? { ...prev, stages: prev.stages.map((item) => item.id === stage.id ? { ...item, name: event.target.value } : item) } : prev)} />
                        <Select value={stage.stageType} onValueChange={(value) => setEditCalendarItem((prev) => prev ? { ...prev, stages: prev.stages.map((item) => item.id === stage.id ? { ...item, stageType: value as SeasonStage["stageType"] } : item) } : prev)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planting">Gieo trồng</SelectItem>
                            <SelectItem value="care">Chăm sóc</SelectItem>
                            <SelectItem value="harvest">Thu hoạch</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input type="number" min={1} max={12} value={stage.startMonth} onChange={(event) => setEditCalendarItem((prev) => prev ? { ...prev, stages: prev.stages.map((item) => item.id === stage.id ? { ...item, startMonth: Number(event.target.value) } : item) } : prev)} />
                        <Input type="number" min={1} max={12} value={stage.endMonth} onChange={(event) => setEditCalendarItem((prev) => prev ? { ...prev, stages: prev.stages.map((item) => item.id === stage.id ? { ...item, endMonth: Number(event.target.value) } : item) } : prev)} />
                        <Input value={(stage.keywords ?? []).join(", ")} onChange={(event) => setEditCalendarItem((prev) => prev ? { ...prev, stages: prev.stages.map((item) => item.id === stage.id ? { ...item, keywords: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) } : item) } : prev)} />
                        <Input type="number" value={stage.sortOrder} onChange={(event) => setEditCalendarItem((prev) => prev ? { ...prev, stages: prev.stages.map((item) => item.id === stage.id ? { ...item, sortOrder: Number(event.target.value) } : item) } : prev)} />
                        <div className="md:col-span-2">
                          <Textarea rows={2} value={stage.description ?? ""} onChange={(event) => setEditCalendarItem((prev) => prev ? { ...prev, stages: prev.stages.map((item) => item.id === stage.id ? { ...item, description: event.target.value } : item) } : prev)} />
                        </div>
                        <div className="md:col-span-2">
                          <Textarea
                            rows={3}
                            value={(stage.careActivities ?? []).join("\n")}
                            onChange={(event) =>
                              setEditCalendarItem((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      stages: prev.stages.map((item) =>
                                        item.id === stage.id
                                          ? {
                                              ...item,
                                              careActivities: event.target.value
                                                .split("\n")
                                                .map((value) => value.trim())
                                                .filter(Boolean),
                                            }
                                          : item,
                                      ),
                                    }
                                  : prev,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-3 rounded-2xl border p-4">
                        <div className="font-medium">Cảnh báo sâu bệnh</div>
                        {(stage.pestWarnings ?? []).map((warning) => (
                          <div key={warning.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                            <div>
                              <div className="font-medium">{warning.name}</div>
                              <div className="text-xs text-muted-foreground">{warning.severity}</div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePestWarning(warning)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </Button>
                          </div>
                        ))}
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input placeholder="Tên sâu bệnh" value={newPestWarningForms[stage.id]?.name ?? ""} onChange={(event) => setNewPestWarningForms((prev) => ({ ...prev, [stage.id]: { ...getDefaultPestWarningDraft(), ...prev[stage.id], name: event.target.value } }))} />
                          <Select value={newPestWarningForms[stage.id]?.severity ?? "medium"} onValueChange={(value) => setNewPestWarningForms((prev) => ({ ...prev, [stage.id]: { ...getDefaultPestWarningDraft(), ...prev[stage.id], severity: value as RecommendationDraft["severity"] } }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">low</SelectItem>
                              <SelectItem value="medium">medium</SelectItem>
                              <SelectItem value="high">high</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="md:col-span-2">
                            <Textarea rows={2} placeholder="Triệu chứng" value={newPestWarningForms[stage.id]?.symptoms ?? ""} onChange={(event) => setNewPestWarningForms((prev) => ({ ...prev, [stage.id]: { ...getDefaultPestWarningDraft(), ...prev[stage.id], symptoms: event.target.value } }))} />
                          </div>
                          <div className="md:col-span-2">
                            <Textarea rows={2} placeholder="Ghi chú phòng ngừa" value={newPestWarningForms[stage.id]?.preventionNote ?? ""} onChange={(event) => setNewPestWarningForms((prev) => ({ ...prev, [stage.id]: { ...getDefaultPestWarningDraft(), ...prev[stage.id], preventionNote: event.target.value } }))} />
                          </div>
                          <Select value={newPestWarningForms[stage.id]?.productId ?? ""} onValueChange={(value) => setNewPestWarningForms((prev) => ({ ...prev, [stage.id]: { ...getDefaultPestWarningDraft(), ...prev[stage.id], productId: value } }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sản phẩm điều trị" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input placeholder="Ghi chú sử dụng" value={newPestWarningForms[stage.id]?.usageNote ?? ""} onChange={(event) => setNewPestWarningForms((prev) => ({ ...prev, [stage.id]: { ...getDefaultPestWarningDraft(), ...prev[stage.id], usageNote: event.target.value } }))} />
                        </div>
                        <Button onClick={() => handleAddPestWarning(stage.id)}>Thêm cảnh báo</Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => handleUpdateStage(stage)}>
                          Lưu giai đoạn
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteStage(stage.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa giai đoạn
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
