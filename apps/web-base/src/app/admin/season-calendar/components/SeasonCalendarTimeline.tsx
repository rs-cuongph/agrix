"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SeasonCalendarItem, SeasonStage } from "@/lib/admin/season-calendar-api";

type StageSelection = {
  calendar: SeasonCalendarItem;
  stage: SeasonStage;
};

type SeasonCalendarTimelineProps = {
  items: SeasonCalendarItem[];
  month: number;
  filterKeyword: string;
  stageFilter: string;
  loading: boolean;
  overlayMode: boolean;
  selectedCropIds: string[];
  onStageSelect: (selection: StageSelection) => void;
};

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const STAGE_TONE: Record<SeasonStage["stageType"], string> = {
  planting: "bg-emerald-500/90",
  care: "bg-sky-500/90",
  harvest: "bg-amber-500/90",
};

function matchesKeyword(item: SeasonCalendarItem, keyword: string) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return { matched: true, localName: null as string | null };
  }

  if (item.crop.name.toLowerCase().includes(normalized)) {
    return { matched: true, localName: null as string | null };
  }

  const localName = item.crop.localNames?.find((name) =>
    name.toLowerCase().includes(normalized),
  );
  return { matched: Boolean(localName), localName: localName ?? null };
}

function isStageVisible(stage: SeasonStage, stageFilter: string) {
  return stageFilter === "all" || stage.stageType === stageFilter;
}

function isMonthInStage(month: number, stage: SeasonStage) {
  if (stage.startMonth <= stage.endMonth) {
    return month >= stage.startMonth && month <= stage.endMonth;
  }
  return month >= stage.startMonth || month <= stage.endMonth;
}

export function SeasonCalendarTimeline({
  items,
  month,
  filterKeyword,
  stageFilter,
  loading,
  overlayMode,
  selectedCropIds,
  onStageSelect,
}: SeasonCalendarTimelineProps) {
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const keywordMatch = matchesKeyword(item, filterKeyword);
        const stageMatch =
          stageFilter === "all" ||
          item.stages.some((stage) => isStageVisible(stage, stageFilter));
        const overlayMatch =
          !overlayMode ||
          !selectedCropIds.length ||
          selectedCropIds.includes(item.crop.id);
        return keywordMatch.matched && stageMatch && overlayMatch;
      })
      .map((item) => ({
        item,
        matchedLocalName: matchesKeyword(item, filterKeyword).localName,
      }));
  }, [filterKeyword, items, overlayMode, selectedCropIds, stageFilter]);

  const workload = useMemo(() => {
    if (!overlayMode || !selectedCropIds.length) {
      return [];
    }

    return MONTHS.map((currentMonth) => {
      const counts = filteredItems.reduce<Record<string, number>>((acc, current) => {
        const stage = current.item.stages.find((candidate) =>
          isMonthInStage(currentMonth, candidate),
        );
        if (stage) {
          acc[stage.stageType] = (acc[stage.stageType] ?? 0) + 1;
        }
        return acc;
      }, {});

      const entry = Object.entries(counts).find(([, count]) => count >= 3);
      if (!entry) {
        return null;
      }
      return {
        month: currentMonth,
        stageType: entry[0],
        count: entry[1],
      };
    });
  }, [filteredItems, overlayMode, selectedCropIds]);

  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[180px,1fr] gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!filteredItems.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          {filterKeyword
            ? "Không tìm thấy cây trồng phù hợp — thử từ khóa khác."
            : "Chưa có dữ liệu mùa vụ cho vùng này."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border bg-white p-4">
      <div
        className="relative min-w-[980px]"
        style={{ display: "grid", gridTemplateColumns: "180px repeat(12, minmax(64px, 1fr))" }}
      >
        <div className="sticky left-0 z-10 bg-white py-3 text-sm font-medium">
          Cây trồng
        </div>
        {MONTHS.map((value) => (
          <div key={value} className="border-b py-3 text-center text-sm font-medium text-slate-600">
            T{value}
          </div>
        ))}

        <div
          className="pointer-events-none absolute bottom-0 top-0 z-0 w-0.5 bg-rose-500"
          style={{ left: `calc(180px + ((100% - 180px) / 12) * ${month - 0.5})` }}
        >
          <span className="absolute -top-5 -translate-x-1/2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            Hôm nay
          </span>
        </div>

        {filteredItems.map(({ item, matchedLocalName }) => (
          <div key={item.id} className="contents">
            <div className="sticky left-0 z-10 flex min-h-[76px] items-center gap-2 border-b bg-white pr-3 text-sm">
              <div>
                <div className="font-medium">{item.crop.name}</div>
                <div className="text-xs text-muted-foreground">{item.seasonName}</div>
                {matchedLocalName ? (
                  <Badge variant="outline" className="mt-2">
                    {matchedLocalName}
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="relative col-span-12 border-b py-3">
              <div className="grid h-full grid-cols-12 gap-1">
                {MONTHS.map((value) => (
                  <div key={`${item.id}-${value}`} className="min-h-[48px] rounded-xl bg-slate-50" />
                ))}
              </div>
              {item.stages
                .filter((stage) => isStageVisible(stage, stageFilter))
                .map((stage) => {
                  const spans =
                    stage.startMonth <= stage.endMonth
                      ? [
                          {
                            start: stage.startMonth,
                            end: stage.endMonth,
                            dashed: false,
                          },
                        ]
                      : [
                          { start: stage.startMonth, end: 12, dashed: true },
                          { start: 1, end: stage.endMonth, dashed: true },
                        ];

                  return spans.map((span, index) => (
                    <button
                      key={`${stage.id}-${index}`}
                      type="button"
                      onMouseEnter={() => setHoveredStageId(stage.id)}
                      onMouseLeave={() => setHoveredStageId(null)}
                      onClick={() => onStageSelect({ calendar: item, stage })}
                      className={`absolute top-1/2 h-10 -translate-y-1/2 rounded-2xl px-3 text-left text-sm font-medium text-white shadow-sm transition hover:scale-[1.01] ${STAGE_TONE[stage.stageType]} ${
                        span.dashed ? "border border-dashed border-white/70" : ""
                      }`}
                      style={{
                        left: `calc(${((span.start - 1) / 12) * 100}% + 4px)`,
                        width: `calc(${((span.end - span.start + 1) / 12) * 100}% - 8px)`,
                      }}
                    >
                      <div className="truncate">{stage.name}</div>
                      {hoveredStageId === stage.id ? (
                        <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border bg-white p-3 text-xs text-slate-700 shadow-xl">
                          <div className="font-semibold">{stage.name}</div>
                          <div className="mt-1 text-muted-foreground">
                            T{stage.startMonth} - T{stage.endMonth}
                          </div>
                          <div className="mt-2 text-muted-foreground">
                            {stage.description ?? "Chưa có mô tả cho giai đoạn này."}
                          </div>
                        </div>
                      ) : null}
                    </button>
                  ));
                })}
            </div>
          </div>
        ))}

        {workload.some(Boolean) ? (
          <div className="contents">
            <div className="sticky left-0 z-10 flex items-center border-b bg-white py-4 text-sm font-medium">
              Tải công việc
            </div>
            {MONTHS.map((currentMonth) => {
              const entry = workload.find((item) => item?.month === currentMonth);
              return (
                <div key={`workload-${currentMonth}`} className="flex items-center justify-center border-b py-4">
                  {entry ? (
                    <Badge className="bg-amber-100 text-amber-700">
                      {entry.count} cây — {entry.stageType}
                    </Badge>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
