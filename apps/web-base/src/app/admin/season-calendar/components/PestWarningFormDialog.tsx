"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  createPestWarning,
  fetchAdminProducts,
  updatePestWarning,
  type CalendarDetail,
  type ProductOption,
} from "@/lib/admin/season-calendar-admin-api";

type PestWarningFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageId: string;
  warning?: CalendarDetail["stages"][number]["pestWarnings"][number] | null;
  onSuccess: () => Promise<void> | void;
};

type UsageNotes = Record<string, string>;

export function PestWarningFormDialog({
  open,
  onOpenChange,
  stageId,
  warning,
  onSuccess,
}: PestWarningFormDialogProps) {
  const isEdit = Boolean(warning?.id);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [symptoms, setSymptoms] = useState("");
  const [preventionNote, setPreventionNote] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [usageNotes, setUsageNotes] = useState<UsageNotes>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    fetchAdminProducts()
      .then((data) => {
        if (active) {
          setProducts(data);
        }
      })
      .catch(() => {
        toast.error("Không tải được danh sách sản phẩm");
      });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSearch("");
    setName(warning?.name ?? "");
    setSeverity(warning?.severity ?? "medium");
    setSymptoms(warning?.symptoms ?? "");
    setPreventionNote(warning?.preventionNote ?? "");
    setSelectedProductIds(
      warning?.treatmentProducts?.map((product) => product.productId) ?? [],
    );
    setUsageNotes(
      Object.fromEntries(
        (warning?.treatmentProducts ?? []).map((product) => [
          product.productId,
          product.usageNote ?? "",
        ]),
      ),
    );
  }, [open, warning]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return products;
    }
    return products.filter((product) =>
      `${product.name} ${product.sku}`.toLowerCase().includes(keyword),
    );
  }, [products, search]);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên sâu bệnh");
      return;
    }

    const body = {
      name: name.trim(),
      severity,
      symptoms: symptoms.trim() || null,
      preventionNote: preventionNote.trim() || null,
      treatmentProductIds: selectedProductIds,
      usageNotes,
    };

    setSubmitting(true);
    try {
      if (warning?.id) {
        await updatePestWarning(warning.id, body);
        toast.success("Đã cập nhật cảnh báo sâu bệnh");
      } else {
        await createPestWarning(stageId, body);
        toast.success("Đã thêm cảnh báo sâu bệnh");
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
          <DialogTitle>
            {isEdit ? "Cập nhật cảnh báo sâu bệnh" : "Thêm cảnh báo sâu bệnh"}
          </DialogTitle>
          <DialogDescription>
            Gắn mức độ nghiêm trọng, triệu chứng và sản phẩm xử lý cho giai đoạn này.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="warning-name">Tên sâu bệnh</Label>
              <Input
                id="warning-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label>Mức độ</Label>
              <Select
                value={severity}
                onValueChange={(value) =>
                  setSeverity(value as "low" | "medium" | "high")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="warning-symptoms">Triệu chứng</Label>
            <Textarea
              id="warning-symptoms"
              rows={3}
              value={symptoms}
              onChange={(event) => setSymptoms(event.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="warning-prevention">Phòng ngừa</Label>
            <Textarea
              id="warning-prevention"
              rows={3}
              value={preventionNote}
              onChange={(event) => setPreventionNote(event.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="grid gap-3 rounded-2xl border p-4">
            <div className="grid gap-2">
              <Label>Sản phẩm phòng trị</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo tên hoặc SKU"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border p-2">
              {filteredProducts.map((product) => {
                const checked = selectedProductIds.includes(product.id);
                return (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        setSelectedProductIds((prev) =>
                          value
                            ? [...prev, product.id]
                            : prev.filter((item) => item !== product.id),
                        )
                      }
                    />
                    <span>
                      {product.name} • {product.sku}
                    </span>
                  </label>
                );
              })}
            </div>

            {selectedProductIds.length ? (
              <div className="grid gap-3">
                {selectedProductIds.map((productId) => {
                  const product = products.find((item) => item.id === productId);
                  if (!product) {
                    return null;
                  }
                  return (
                    <div key={productId} className="grid gap-2">
                      <Label htmlFor={`usage-note-${productId}`}>
                        Ghi chú liều dùng cho {product.name}
                      </Label>
                      <Input
                        id={`usage-note-${productId}`}
                        value={usageNotes[productId] ?? ""}
                        onChange={(event) =>
                          setUsageNotes((prev) => ({
                            ...prev,
                            [productId]: event.target.value,
                          }))
                        }
                        placeholder="VD: Pha 20ml/bình 16 lít"
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}
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
            {isEdit ? "Lưu cảnh báo" : "Thêm cảnh báo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
