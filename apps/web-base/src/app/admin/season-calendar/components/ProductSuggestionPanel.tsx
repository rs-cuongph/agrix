"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Package2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchSuggestions,
  type SuggestionResponse,
} from "@/lib/admin/season-calendar-api";

function formatPrice(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

export function ProductSuggestionPanel({
  zoneId,
  month,
  cropId,
  stageId,
  open,
}: {
  zoneId: string;
  month: number;
  cropId: string;
  stageId?: string;
  open: boolean;
}) {
  const [data, setData] = useState<SuggestionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !zoneId || !month || !cropId) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetchSuggestions(zoneId, month, cropId, stageId)
      .then((response) => {
        if (active) {
          setData(response);
        }
      })
      .catch((err: Error) => {
        if (active) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [cropId, month, open, stageId, zoneId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle>Không tải được gợi ý</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data || data.products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chưa có gợi ý</CardTitle>
          <CardDescription>
            Thêm `product recommendation` trong phần quản trị để hiển thị gợi ý.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-emerald-50/80">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-[0.2em] text-emerald-700">
            Gợi ý mùa vụ
          </CardTitle>
          <CardDescription className="text-foreground">
            {data.explanation}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {data.products.map((product) => (
          <Card key={product.id} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package2 className="h-4 w-4 text-emerald-600" />
                <Link
                  href={`/products/${product.id}`}
                  className="hover:underline"
                >
                  {product.name}
                </Link>
              </CardTitle>
              <CardDescription>SKU: {product.sku}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {formatPrice(product.baseSellPrice)}/{product.baseUnit}
                </Badge>
                <Badge
                  variant={
                    product.currentStockBase > 0 ? "secondary" : "destructive"
                  }
                >
                  {product.currentStockBase > 0
                    ? `Còn ${product.currentStockBase} ${product.baseUnit}`
                    : "Hết hàng"}
                </Badge>
                <Badge variant="outline">Ưu tiên {product.priority}</Badge>
              </div>
              {product.reason ? (
                <p className="text-sm text-muted-foreground">
                  {product.reason}
                </p>
              ) : null}
              {product.dosageNote ? (
                <p className="text-sm font-medium text-amber-700">
                  Liều lượng: {product.dosageNote}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {data.alternatives?.length ? (
        <Card size="sm" className="border-amber-200 bg-amber-50/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Gợi ý thay thế
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.alternatives.map((alternative) => (
              <div
                key={alternative.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2"
              >
                <div>
                  <p className="font-medium">{alternative.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {alternative.sku}
                  </p>
                </div>
                <Badge variant="outline">
                  {alternative.currentStockBase} {alternative.baseUnit}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
