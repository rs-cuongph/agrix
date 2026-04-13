"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  SeasonCalendarItem,
  SeasonStage,
} from "@/lib/admin/season-calendar-api";
import { ProductSuggestionPanel } from "./ProductSuggestionPanel";

type StageDetailSheetProps = {
  calendar: SeasonCalendarItem | null;
  stage: SeasonStage | null;
  zoneId: string;
  month: number;
  open: boolean;
  onClose: () => void;
};

const STAGE_LABELS: Record<SeasonStage["stageType"], string> = {
  planting: "Gieo trồng",
  care: "Chăm sóc",
  harvest: "Thu hoạch",
};

const STAGE_TONE: Record<SeasonStage["stageType"], string> = {
  planting: "bg-emerald-100 text-emerald-700 border-emerald-200",
  care: "bg-sky-100 text-sky-700 border-sky-200",
  harvest: "bg-amber-100 text-amber-700 border-amber-200",
};

const PEST_TONE = {
  low: "bg-blue-100 text-blue-700 border-blue-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-rose-100 text-rose-700 border-rose-200",
} as const;

function monthLabel(month: number): string {
  return `T${month}`;
}

export function StageDetailSheet({
  calendar,
  stage,
  zoneId,
  month,
  open,
  onClose,
}: StageDetailSheetProps) {
  const checklist = useMemo(
    () =>
      Object.fromEntries(
        (stage?.careActivities ?? []).map((item) => [item, false]),
      ),
    [stage?.careActivities],
  );
  const [checkedItems, setCheckedItems] =
    useState<Record<string, boolean>>(checklist);

  useEffect(() => {
    setCheckedItems(checklist);
  }, [checklist]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCheckedItems(checklist);
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        {calendar && stage ? (
          <>
            <SheetHeader>
              <SheetTitle>{calendar.crop.name}</SheetTitle>
              <SheetDescription>
                {calendar.seasonName} • {stage.name} • Tháng {month}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-4 pb-6">
              <Card>
                <CardContent className="space-y-3 pt-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={STAGE_TONE[stage.stageType]}>
                      {STAGE_LABELS[stage.stageType]}
                    </Badge>
                    <Badge variant="outline">
                      {monthLabel(stage.startMonth)} - {monthLabel(stage.endMonth)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stage.description ?? "Chưa có mô tả hoạt động cho giai đoạn này."}
                  </p>
                  {stage.keywords?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {stage.keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {stage.careActivities?.length ? (
                <Card>
                  <CardContent className="space-y-3 pt-5">
                    <div className="text-sm font-medium">Checklist chăm sóc</div>
                    <div className="space-y-3">
                      {stage.careActivities.map((activity) => (
                        <label
                          key={activity}
                          className="flex items-start gap-3 rounded-xl border p-3 text-sm"
                        >
                          <Checkbox
                            checked={checkedItems[activity] ?? false}
                            onCheckedChange={(checked) =>
                              setCheckedItems((prev) => ({
                                ...prev,
                                [activity]: Boolean(checked),
                              }))
                            }
                          />
                          <span>{activity}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {stage.pestWarnings?.length ? (
                <Card>
                  <CardContent className="space-y-4 pt-5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Cảnh báo sâu bệnh
                    </div>
                    {stage.pestWarnings.map((warning) => (
                      <div key={warning.id} className="rounded-2xl border p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-medium">{warning.name}</div>
                          <Badge className={PEST_TONE[warning.severity]}>
                            {warning.severity}
                          </Badge>
                        </div>
                        {warning.symptoms ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {warning.symptoms}
                          </p>
                        ) : null}
                        {warning.preventionNote ? (
                          <p className="mt-2 text-sm">
                            <span className="font-medium">Phòng ngừa:</span>{" "}
                            {warning.preventionNote}
                          </p>
                        ) : null}
                        {warning.treatmentProducts.length ? (
                          <div className="mt-3 space-y-2">
                            {warning.treatmentProducts.map((product) => (
                              <div
                                key={`${warning.id}-${product.productId}`}
                                className="rounded-xl bg-muted/50 p-3 text-sm"
                              >
                                <div className="font-medium">
                                  {product.productName}
                                </div>
                                <div className="text-muted-foreground">
                                  SKU: {product.productSku}
                                </div>
                                {product.usageNote ? (
                                  <div className="mt-1">{product.usageNote}</div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}

              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Gợi ý sản phẩm
              </div>
              <ProductSuggestionPanel
                zoneId={zoneId}
                month={month}
                cropId={calendar.crop.id}
                stageId={stage.id}
                open={open}
              />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
