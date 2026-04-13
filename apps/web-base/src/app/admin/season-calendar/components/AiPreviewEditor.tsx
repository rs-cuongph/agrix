"use client";

import { Info, Plus, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { AiGenerateResult } from "@/lib/admin/season-calendar-admin-api";

type AiPreviewEditorProps = {
  value: AiGenerateResult;
  onChange: (value: AiGenerateResult) => void;
};

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export function AiPreviewEditor({ value, onChange }: AiPreviewEditorProps) {
  function updateSeason(
    seasonIndex: number,
    updater: (season: AiGenerateResult["seasons"][number]) => AiGenerateResult["seasons"][number],
  ) {
    onChange({
      seasons: value.seasons.map((season, index) =>
        index === seasonIndex ? updater(season) : season,
      ),
    });
  }

  function updateStage(
    seasonIndex: number,
    stageIndex: number,
    updater: (
      stage: AiGenerateResult["seasons"][number]["stages"][number],
    ) => AiGenerateResult["seasons"][number]["stages"][number],
  ) {
    updateSeason(seasonIndex, (season) => ({
      ...season,
      stages: season.stages.map((stage, index) =>
        index === stageIndex ? updater(stage) : stage,
      ),
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <Info className="mt-0.5 h-4 w-4" />
        <p>
          Kết quả AI mang tính tham khảo, vui lòng kiểm tra lại với chuyên gia nông nghiệp.
        </p>
      </div>

      <Accordion type="multiple" className="space-y-3">
        {value.seasons.map((season, seasonIndex) => (
          <AccordionItem
            key={`ai-season-${seasonIndex}`}
            value={`season-${seasonIndex}`}
            className="overflow-hidden rounded-2xl border bg-white px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-wrap items-center gap-2 text-left">
                <span className="font-medium">{season.seasonName}</span>
                <Badge variant="outline">{season.stages.length} giai đoạn</Badge>
              </div>
            </AccordionTrigger>

            <AccordionContent className="space-y-4 pb-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-[240px] flex-1 space-y-2">
                  <Label>Tên mùa vụ</Label>
                  <Input
                    value={season.seasonName}
                    onChange={(event) =>
                      updateSeason(seasonIndex, (current) => ({
                        ...current,
                        seasonName: event.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onChange({
                      seasons: value.seasons.filter((_, index) => index !== seasonIndex),
                    })
                  }
                >
                  <X className="mr-2 h-4 w-4" />
                  Xóa mùa vụ
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea
                  rows={3}
                  value={season.notes ?? ""}
                  onChange={(event) =>
                    updateSeason(seasonIndex, (current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-4">
                {season.stages.map((stage, stageIndex) => (
                  <div key={`ai-stage-${stageIndex}`} className="rounded-2xl border p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="font-medium">Giai đoạn {stageIndex + 1}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateSeason(seasonIndex, (current) => ({
                            ...current,
                            stages: current.stages.filter(
                              (_, index) => index !== stageIndex,
                            ),
                          }))
                        }
                      >
                        <X className="mr-2 h-4 w-4" />
                        Xóa giai đoạn
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label>Tên giai đoạn</Label>
                          <Input
                            value={stage.name}
                            onChange={(event) =>
                              updateStage(seasonIndex, stageIndex, (current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Loại giai đoạn</Label>
                          <Select
                            value={stage.stageType}
                            onValueChange={(selected) =>
                              updateStage(seasonIndex, stageIndex, (current) => ({
                                ...current,
                                stageType: selected as typeof current.stageType,
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
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label>Tháng bắt đầu</Label>
                          <Select
                            value={String(stage.startMonth)}
                            onValueChange={(selected) =>
                              updateStage(seasonIndex, stageIndex, (current) => ({
                                ...current,
                                startMonth: Number(selected),
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MONTHS.map((month) => (
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
                            value={String(stage.endMonth)}
                            onValueChange={(selected) =>
                              updateStage(seasonIndex, stageIndex, (current) => ({
                                ...current,
                                endMonth: Number(selected),
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MONTHS.map((month) => (
                                <SelectItem key={month} value={String(month)}>
                                  Tháng {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Mô tả</Label>
                        <Textarea
                          rows={3}
                          value={stage.description ?? ""}
                          onChange={(event) =>
                            updateStage(seasonIndex, stageIndex, (current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Hoạt động chăm sóc</Label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStage(seasonIndex, stageIndex, (current) => ({
                                ...current,
                                careActivities: [...(current.careActivities ?? []), ""],
                              }))
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm hoạt động
                          </Button>
                        </div>

                        {(stage.careActivities ?? []).map((activity, activityIndex) => (
                          <div
                            key={`care-activity-${activityIndex}`}
                            className="flex items-center gap-2"
                          >
                            <Input
                              value={activity}
                              onChange={(event) =>
                                updateStage(seasonIndex, stageIndex, (current) => ({
                                  ...current,
                                  careActivities: (current.careActivities ?? []).map(
                                    (item, index) =>
                                      index === activityIndex ? event.target.value : item,
                                  ),
                                }))
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                updateStage(seasonIndex, stageIndex, (current) => ({
                                  ...current,
                                  careActivities: (current.careActivities ?? []).filter(
                                    (_, index) => index !== activityIndex,
                                  ),
                                }))
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label>Cảnh báo sâu bệnh</Label>
                        {(stage.pestWarnings ?? []).map((warning, warningIndex) => (
                          <div key={`warning-${warningIndex}`} className="rounded-xl border p-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <Input
                                value={warning.name}
                                onChange={(event) =>
                                  updateStage(seasonIndex, stageIndex, (current) => ({
                                    ...current,
                                    pestWarnings: (current.pestWarnings ?? []).map(
                                      (item, index) =>
                                        index === warningIndex
                                          ? { ...item, name: event.target.value }
                                          : item,
                                    ),
                                  }))
                                }
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  updateStage(seasonIndex, stageIndex, (current) => ({
                                    ...current,
                                    pestWarnings: (current.pestWarnings ?? []).filter(
                                      (_, index) => index !== warningIndex,
                                    ),
                                  }))
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid gap-2 md:grid-cols-3">
                              <Select
                                value={warning.severity}
                                onValueChange={(selected) =>
                                  updateStage(seasonIndex, stageIndex, (current) => ({
                                    ...current,
                                    pestWarnings: (current.pestWarnings ?? []).map(
                                      (item, index) =>
                                        index === warningIndex
                                          ? {
                                              ...item,
                                              severity: selected as typeof item.severity,
                                            }
                                          : item,
                                    ),
                                  }))
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
                              <Input
                                className="md:col-span-2"
                                value={warning.symptoms ?? ""}
                                onChange={(event) =>
                                  updateStage(seasonIndex, stageIndex, (current) => ({
                                    ...current,
                                    pestWarnings: (current.pestWarnings ?? []).map(
                                      (item, index) =>
                                        index === warningIndex
                                          ? { ...item, symptoms: event.target.value }
                                          : item,
                                    ),
                                  }))
                                }
                                placeholder="Triệu chứng"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
