"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import {
  addStage,
  updateStage,
  type CalendarDetail,
} from "@/lib/admin/season-calendar-admin-api";

type StageFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendarId: string;
  stage?: CalendarDetail["stages"][number] | null;
  onSuccess: () => Promise<void> | void;
};

type StageFormState = {
  name: string;
  stageType: "planting" | "care" | "harvest";
  startMonth: number;
  endMonth: number;
  description: string;
  keywords: string;
  sortOrder: number;
  careActivities: string[];
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

function buildInitialState(
  stage?: CalendarDetail["stages"][number] | null,
): StageFormState {
  return {
    name: stage?.name ?? "",
    stageType: stage?.stageType ?? "planting",
    startMonth: stage?.startMonth ?? 1,
    endMonth: stage?.endMonth ?? 1,
    description: stage?.description ?? "",
    keywords: stage?.keywords?.join(", ") ?? "",
    sortOrder: stage?.sortOrder ?? 1,
    careActivities: stage?.careActivities?.length
      ? [...stage.careActivities]
      : [""],
  };
}

export function StageFormDialog({
  open,
  onOpenChange,
  calendarId,
  stage,
  onSuccess,
}: StageFormDialogProps) {
  const [form, setForm] = useState<StageFormState>(buildInitialState(stage));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setForm(buildInitialState(stage));
  }, [open, stage]);

  const title = useMemo(
    () => (stage ? "Cập nhật giai đoạn" : "Thêm giai đoạn"),
    [stage],
  );

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên giai đoạn");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        name: form.name.trim(),
        stageType: form.stageType,
        startMonth: form.startMonth,
        endMonth: form.endMonth,
        description: form.description.trim() || null,
        keywords: form.keywords
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        careActivities: form.careActivities
          .map((value) => value.trim())
          .filter(Boolean),
        sortOrder: Number(form.sortOrder || 0),
      };

      if (stage?.id) {
        await updateStage(stage.id, body);
        toast.success("Đã cập nhật giai đoạn");
      } else {
        await addStage(calendarId, body);
        toast.success("Đã thêm giai đoạn");
      }

      await onSuccess();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Khai báo mốc thời gian, hoạt động chăm sóc và keyword cho giai đoạn.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="stage-name">Tên giai đoạn</Label>
            <Input
              id="stage-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              disabled={submitting}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Loại giai đoạn</Label>
              <Select
                value={form.stageType}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    stageType: value as StageFormState["stageType"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planting">Gieo trồng</SelectItem>
                  <SelectItem value="care">Chăm sóc</SelectItem>
                  <SelectItem value="harvest">Thu hoạch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stage-sort-order">Thứ tự</Label>
              <Input
                id="stage-sort-order"
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    sortOrder: Number(event.target.value || 0),
                  }))
                }
                disabled={submitting}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tháng bắt đầu</Label>
              <Select
                value={String(form.startMonth)}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, startMonth: Number(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((month) => (
                    <SelectItem key={month} value={String(month)}>
                      Tháng {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tháng kết thúc</Label>
              <Select
                value={String(form.endMonth)}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, endMonth: Number(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((month) => (
                    <SelectItem key={month} value={String(month)}>
                      Tháng {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stage-description">Mô tả</Label>
            <Textarea
              id="stage-description"
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              disabled={submitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stage-keywords">Keywords</Label>
            <Input
              id="stage-keywords"
              value={form.keywords}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, keywords: event.target.value }))
              }
              placeholder="Gieo sạ, xuống giống, bón lót"
              disabled={submitting}
            />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Hoạt động chăm sóc</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    careActivities: [...prev.careActivities, ""],
                  }))
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm hoạt động
              </Button>
            </div>

            {form.careActivities.map((activity, index) => (
              <div key={`activity-${index}`} className="flex items-center gap-2">
                <Input
                  value={activity}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      careActivities: prev.careActivities.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item,
                      ),
                    }))
                  }
                  placeholder={`Hoạt động ${index + 1}`}
                  disabled={submitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      careActivities:
                        prev.careActivities.length === 1
                          ? [""]
                          : prev.careActivities.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                    }))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {stage ? "Lưu giai đoạn" : "Thêm giai đoạn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
