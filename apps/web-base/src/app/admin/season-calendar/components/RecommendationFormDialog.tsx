"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  addRecommendation,
  fetchAdminProducts,
  type ProductOption,
} from "@/lib/admin/season-calendar-admin-api";

type RecommendationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageId: string;
  onSuccess: () => Promise<void> | void;
};

export function RecommendationFormDialog({
  open,
  onOpenChange,
  stageId,
  onSuccess,
}: RecommendationFormDialogProps) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productOpen, setProductOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [reason, setReason] = useState("");
  const [dosageNote, setDosageNote] = useState("");
  const [priority, setPriority] = useState(1);
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
    if (open) {
      setProductId("");
      setReason("");
      setDosageNote("");
      setPriority(1);
      setProductOpen(false);
    }
  }, [open]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? null,
    [productId, products],
  );

  async function handleSubmit() {
    if (!productId) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }

    setSubmitting(true);
    try {
      await addRecommendation(stageId, {
        productId,
        reason: reason.trim() || null,
        dosageNote: dosageNote.trim() || null,
        priority: Number(priority || 1),
      });
      toast.success("Đã thêm sản phẩm gợi ý");
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
          <DialogTitle>Thêm sản phẩm gợi ý</DialogTitle>
          <DialogDescription>
            Chọn sản phẩm, lý do khuyến nghị và liều lượng áp dụng cho giai đoạn này.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Sản phẩm</Label>
            <Popover open={productOpen} onOpenChange={setProductOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {selectedProduct
                    ? `${selectedProduct.name} (${selectedProduct.sku})`
                    : "Tìm sản phẩm theo tên hoặc SKU"}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[420px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Tìm sản phẩm..." />
                  <CommandList>
                    <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                    <CommandGroup>
                      {products.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={`${product.name} ${product.sku}`}
                          onSelect={() => {
                            setProductId(product.id);
                            setProductOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              productId === product.id ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <span>
                            {product.name} • {product.sku}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recommendation-reason">Lý do gợi ý</Label>
            <Textarea
              id="recommendation-reason"
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="recommendation-dosage">Liều lượng</Label>
              <Input
                id="recommendation-dosage"
                value={dosageNote}
                onChange={(event) => setDosageNote(event.target.value)}
                placeholder="VD: 25kg/ha"
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="recommendation-priority">Ưu tiên</Label>
              <Input
                id="recommendation-priority"
                type="number"
                min={1}
                max={5}
                value={priority}
                onChange={(event) => setPriority(Number(event.target.value || 1))}
                disabled={submitting}
              />
            </div>
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
            Thêm sản phẩm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
