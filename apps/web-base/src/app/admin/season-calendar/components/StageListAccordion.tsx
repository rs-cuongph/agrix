"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deletePestWarning, deleteRecommendation, deleteStage, type CalendarDetail } from "@/lib/admin/season-calendar-admin-api";
import { PestWarningFormDialog } from "./PestWarningFormDialog";
import { RecommendationFormDialog } from "./RecommendationFormDialog";
import { StageFormDialog } from "./StageFormDialog";

type StageListAccordionProps = {
  calendarId: string;
  stages: CalendarDetail["stages"];
  onRefresh: () => Promise<void> | void;
};

const STAGE_LABELS = {
  planting: "Gieo trồng",
  care: "Chăm sóc",
  harvest: "Thu hoạch",
} as const;

const STAGE_TONE = {
  planting: "border-emerald-200 bg-emerald-50 text-emerald-700",
  care: "border-sky-200 bg-sky-50 text-sky-700",
  harvest: "border-amber-200 bg-amber-50 text-amber-700",
} as const;

const PEST_TONE = {
  low: "border-blue-200 bg-blue-50 text-blue-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-rose-200 bg-rose-50 text-rose-700",
} as const;

export function StageListAccordion({
  calendarId,
  stages,
  onRefresh,
}: StageListAccordionProps) {
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<CalendarDetail["stages"][number] | null>(null);
  const [recommendationStageId, setRecommendationStageId] = useState<string | null>(null);
  const [pestDialogTarget, setPestDialogTarget] = useState<{
    stageId: string;
    warning?: CalendarDetail["stages"][number]["pestWarnings"][number] | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "stage"; id: string; label: string }
    | { type: "recommendation"; id: string; label: string }
    | { type: "warning"; id: string; label: string }
    | null
  >(null);

  const orderedStages = useMemo(
    () =>
      [...stages].sort((left, right) => {
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }
        return left.startMonth - right.startMonth;
      }),
    [stages],
  );

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    if (deleteTarget.type === "stage") {
      await deleteStage(deleteTarget.id);
      toast.success("Đã xóa giai đoạn");
    }

    if (deleteTarget.type === "recommendation") {
      await deleteRecommendation(deleteTarget.id);
      toast.success("Đã xóa sản phẩm gợi ý");
    }

    if (deleteTarget.type === "warning") {
      await deletePestWarning(deleteTarget.id);
      toast.success("Đã xóa cảnh báo sâu bệnh");
    }

    setDeleteTarget(null);
    await onRefresh();
  }

  return (
    <>
      {orderedStages.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Chưa có giai đoạn nào. Thêm giai đoạn đầu tiên.
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {orderedStages.map((stage) => (
            <AccordionItem
              key={stage.id}
              value={stage.id}
              className="overflow-hidden rounded-2xl border bg-white px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-col items-start gap-2 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{stage.name}</span>
                    <Badge className={STAGE_TONE[stage.stageType]}>
                      {STAGE_LABELS[stage.stageType]}
                    </Badge>
                    <Badge variant="outline">
                      T{stage.startMonth}–T{stage.endMonth}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Thứ tự {stage.sortOrder}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="space-y-5 pb-5">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {stage.description ?? "Chưa có mô tả cho giai đoạn này."}
                  </p>

                  {stage.keywords?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {stage.keywords.map((keyword) => (
                        <Badge key={`${stage.id}-${keyword}`} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Hoạt động chăm sóc</h4>
                    {stage.careActivities?.length ? (
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {stage.careActivities.map((activity, index) => (
                          <li key={`${stage.id}-activity-${index}`}>
                            {index + 1}. {activity}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Chưa có hoạt động chăm sóc.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium">Sản phẩm gợi ý</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setRecommendationStageId(stage.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm sản phẩm
                    </Button>
                  </div>
                  {stage.recommendations.length ? (
                    <div className="space-y-3">
                      {stage.recommendations.map((recommendation) => (
                        <div
                          key={recommendation.id}
                          className="flex flex-wrap items-start justify-between gap-3 rounded-xl border p-3"
                        >
                          <div className="space-y-1 text-sm">
                            <div className="font-medium">
                              {recommendation.product?.name ?? recommendation.productId}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {recommendation.product?.sku ? (
                                <Badge variant="outline">
                                  {recommendation.product.sku}
                                </Badge>
                              ) : null}
                              <Badge variant="outline">
                                Ưu tiên {recommendation.priority}
                              </Badge>
                            </div>
                            {recommendation.reason ? (
                              <p className="text-muted-foreground">
                                {recommendation.reason}
                              </p>
                            ) : null}
                            {recommendation.dosageNote ? (
                              <p>Liều lượng: {recommendation.dosageNote}</p>
                            ) : null}
                          </div>

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              setDeleteTarget({
                                type: "recommendation",
                                id: recommendation.id,
                                label: recommendation.product?.name ?? "sản phẩm gợi ý",
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có sản phẩm gợi ý.
                    </p>
                  )}
                </div>

                <div className="space-y-3 rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Cảnh báo sâu bệnh
                    </h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setPestDialogTarget({ stageId: stage.id, warning: null })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm sâu bệnh
                    </Button>
                  </div>

                  {stage.pestWarnings.length ? (
                    <div className="space-y-3">
                      {stage.pestWarnings.map((warning) => (
                        <div
                          key={warning.id}
                          className="rounded-xl border p-3 text-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{warning.name}</span>
                                <Badge className={PEST_TONE[warning.severity]}>
                                  {warning.severity}
                                </Badge>
                              </div>
                              {warning.symptoms ? (
                                <p className="text-muted-foreground">
                                  {warning.symptoms}
                                </p>
                              ) : null}
                              {warning.preventionNote ? (
                                <p>Phòng ngừa: {warning.preventionNote}</p>
                              ) : null}
                              <p className="text-muted-foreground">
                                {warning.treatmentProducts.length} sản phẩm điều trị
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  setPestDialogTarget({
                                    stageId: stage.id,
                                    warning,
                                  })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "warning",
                                    id: warning.id,
                                    label: warning.name,
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có cảnh báo sâu bệnh.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingStage(stage);
                      setStageDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Sửa giai đoạn
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      setDeleteTarget({
                        type: "stage",
                        id: stage.id,
                        label: stage.name,
                      })
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa giai đoạn
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <StageFormDialog
        open={stageDialogOpen}
        onOpenChange={(open) => {
          setStageDialogOpen(open);
          if (!open) {
            setEditingStage(null);
          }
        }}
        calendarId={calendarId}
        stage={editingStage}
        onSuccess={onRefresh}
      />

      <RecommendationFormDialog
        open={Boolean(recommendationStageId)}
        onOpenChange={(open) => {
          if (!open) {
            setRecommendationStageId(null);
          }
        }}
        stageId={recommendationStageId ?? ""}
        onSuccess={onRefresh}
      />

      <PestWarningFormDialog
        open={Boolean(pestDialogTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setPestDialogTarget(null);
          }
        }}
        stageId={pestDialogTarget?.stageId ?? ""}
        warning={pestDialogTarget?.warning ?? null}
        onSuccess={onRefresh}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa {deleteTarget?.label ?? "mục này"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
