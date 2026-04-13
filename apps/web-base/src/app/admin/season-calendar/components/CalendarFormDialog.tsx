"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  createCalendar,
  updateCalendar,
  type CalendarDetail,
} from "@/lib/admin/season-calendar-admin-api";
import {
  fetchCrops,
  fetchZones,
  type SeasonCrop,
  type SeasonZone,
} from "@/lib/admin/season-calendar-api";

type CalendarFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<CalendarDetail> | null;
  onSuccess: () => Promise<void> | void;
};

type FormState = {
  zoneId: string;
  cropId: string;
  seasonName: string;
  notes: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  zoneId: "",
  cropId: "",
  seasonName: "",
  notes: "",
  isActive: true,
};

export function CalendarFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: CalendarFormDialogProps) {
  const isEdit = Boolean(initialData?.id);
  const [zones, setZones] = useState<SeasonZone[]>([]);
  const [crops, setCrops] = useState<SeasonCrop[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    setLoadingOptions(true);

    Promise.all([fetchZones(), fetchCrops()])
      .then(([zoneData, cropData]) => {
        if (!active) {
          return;
        }
        setZones(zoneData);
        setCrops(cropData);
      })
      .catch(() => {
        toast.error("Không tải được danh sách vùng hoặc cây trồng");
      })
      .finally(() => {
        if (active) {
          setLoadingOptions(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      zoneId: initialData?.zone?.id ?? "",
      cropId: initialData?.crop?.id ?? "",
      seasonName: initialData?.seasonName ?? "",
      notes: initialData?.notes ?? "",
      isActive: initialData?.isActive ?? true,
    });
  }, [initialData, open]);

  async function handleSubmit() {
    if (!form.zoneId || !form.cropId || !form.seasonName.trim()) {
      toast.error("Vui lòng nhập đủ vùng, cây trồng và tên mùa vụ");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        zoneId: form.zoneId,
        cropId: form.cropId,
        seasonName: form.seasonName.trim(),
        notes: form.notes.trim() || null,
        isActive: form.isActive,
      };

      if (initialData?.id) {
        await updateCalendar(initialData.id, body);
        toast.success("Đã cập nhật mùa vụ");
      } else {
        await createCalendar(body);
        toast.success("Đã tạo mùa vụ");
      }

      await onSuccess();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật mùa vụ" : "Thêm mùa vụ"}
          </DialogTitle>
          <DialogDescription>
            Chọn vùng, cây trồng và metadata cơ bản cho mùa vụ.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="calendar-zone">Vùng nông nghiệp</Label>
            <Select
              disabled={loadingOptions || submitting}
              value={form.zoneId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, zoneId: value }))
              }
            >
              <SelectTrigger id="calendar-zone">
                <SelectValue placeholder="Chọn vùng" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="calendar-crop">Cây trồng</Label>
            <Select
              disabled={loadingOptions || submitting}
              value={form.cropId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, cropId: value }))
              }
            >
              <SelectTrigger id="calendar-crop">
                <SelectValue placeholder="Chọn cây trồng" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="calendar-name">Tên mùa vụ</Label>
            <Input
              id="calendar-name"
              value={form.seasonName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, seasonName: event.target.value }))
              }
              placeholder="VD: Vụ Đông Xuân"
              disabled={submitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="calendar-notes">Ghi chú</Label>
            <Textarea
              id="calendar-notes"
              rows={4}
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              placeholder="Thông tin bổ sung cho mùa vụ"
              disabled={submitting}
            />
          </div>

          {isEdit ? (
            <label className="flex items-center gap-3 rounded-xl border px-3 py-2 text-sm">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: Boolean(checked) }))
                }
              />
              <span>Kích hoạt mùa vụ này</span>
            </label>
          ) : null}
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
            {isEdit ? "Lưu thay đổi" : "Tạo mùa vụ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
