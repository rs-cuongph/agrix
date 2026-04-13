"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  aiGenerateCalendar,
  bulkCreateCalendars,
  checkExistingCalendars,
  type AiGenerateResult,
} from "@/lib/admin/season-calendar-admin-api";
import {
  fetchCrops,
  fetchZones,
  type SeasonCrop,
  type SeasonZone,
} from "@/lib/admin/season-calendar-api";
import { AiPreviewEditor } from "./AiPreviewEditor";

type AiGenerateDialogProps = {
  onSuccess: () => Promise<void> | void;
};

type Step = "form" | "loading" | "preview" | "error";

export function AiGenerateDialog({ onSuccess }: AiGenerateDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [zones, setZones] = useState<SeasonZone[]>([]);
  const [crops, setCrops] = useState<SeasonCrop[]>([]);
  const [zoneId, setZoneId] = useState("");
  const [cropId, setCropId] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [preview, setPreview] = useState<AiGenerateResult | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    Promise.all([fetchZones(), fetchCrops()])
      .then(([zoneData, cropData]) => {
        if (!active) {
          return;
        }
        setZones(zoneData);
        setCrops(cropData);
      })
      .catch(() => {
        toast.error("Không tải được dữ liệu vùng hoặc cây trồng");
      });

    return () => {
      active = false;
    };
  }, [open]);

  const selectedCrop = useMemo(
    () => crops.find((crop) => crop.id === cropId) ?? null,
    [cropId, crops],
  );

  async function executeGenerate(nextReplaceExisting: boolean) {
    setDuplicateDialogOpen(false);
    setReplaceExisting(nextReplaceExisting);
    setStep("loading");

    try {
      const result = await aiGenerateCalendar({
        zoneId,
        cropId,
        userNotes: userNotes.trim() || undefined,
      });
      setPreview(result);
      setStep("preview");
    } catch {
      setStep("error");
      toast.error("Không thể tạo lịch tự động");
    }
  }

  async function handleGenerateClick() {
    if (!zoneId || !cropId) {
      toast.error("Vui lòng chọn vùng và cây trồng");
      return;
    }

    const duplicate = await checkExistingCalendars(zoneId, cropId);
    if (duplicate.count > 0) {
      setDuplicateCount(duplicate.count);
      setDuplicateDialogOpen(true);
      return;
    }

    await executeGenerate(false);
  }

  async function handleSave() {
    if (!preview) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await bulkCreateCalendars({
        zoneId,
        cropId,
        replaceExisting,
        seasons: preview.seasons,
      });
      toast.success(result.message, {
        description: `${result.pestWarningsCreated} cảnh báo sâu bệnh đã được tạo`,
      });
      await onSuccess();
      setOpen(false);
      setStep("form");
      setPreview(null);
      setUserNotes("");
      setZoneId("");
      setCropId("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setStep("form");
            setPreview(null);
            setDuplicateDialogOpen(false);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            AI tạo lịch
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>AI tạo lịch mùa vụ</DialogTitle>
            <DialogDescription>
              Chọn vùng và cây trồng để AI tạo sẵn lịch mùa vụ có thể chỉnh sửa trước khi lưu.
            </DialogDescription>
          </DialogHeader>

          {step === "form" ? (
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Vùng nông nghiệp</Label>
                  <Select value={zoneId} onValueChange={setZoneId}>
                    <SelectTrigger>
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
                  <Label>Cây trồng</Label>
                  <Select value={cropId} onValueChange={setCropId}>
                    <SelectTrigger>
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
              </div>

              <div className="grid gap-2">
                <Label>Ghi chú thêm</Label>
                <Textarea
                  rows={4}
                  value={userNotes}
                  onChange={(event) => setUserNotes(event.target.value)}
                  placeholder="VD: giống robusta, có tưới nhỏ giọt..."
                />
              </div>
            </div>
          ) : null}

          {step === "loading" ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                <div>
                  <div className="font-medium">AI đang phân tích dữ liệu nông nghiệp...</div>
                  <p className="text-sm text-muted-foreground">
                    Quá trình này có thể mất 5-15 giây.
                  </p>
                </div>
              </div>
              <div className="space-y-3 rounded-2xl border p-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ) : null}

          {step === "error" ? (
            <div className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <p className="text-sm text-rose-700">
                Không thể tạo lịch tự động. Bạn có thể thử lại hoặc nhập thủ công.
              </p>
              <div className="flex gap-2">
                <Button type="button" onClick={() => void handleGenerateClick()}>
                  Thử lại
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Nhập thủ công
                </Button>
              </div>
            </div>
          ) : null}

          {step === "preview" && preview ? (
            <AiPreviewEditor value={preview} onChange={setPreview} />
          ) : null}

          <DialogFooter>
            {step === "form" ? (
              <>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={() => void handleGenerateClick()}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tạo lịch
                </Button>
              </>
            ) : null}

            {step === "preview" ? (
              <>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={() => void handleSave()} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Lưu tất cả
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mùa vụ đã tồn tại</AlertDialogTitle>
            <AlertDialogDescription>
              Vùng này đã có {duplicateCount} mùa vụ cho cây {selectedCrop?.name ?? "đã chọn"}.
              Bạn muốn tạo thêm hay thay thế toàn bộ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-wrap gap-2">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <Button type="button" variant="outline" onClick={() => void executeGenerate(false)}>
              Tạo thêm
            </Button>
            <AlertDialogAction onClick={() => void executeGenerate(true)}>
              Thay thế toàn bộ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
