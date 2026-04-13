"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Leaf, Bug, Sprout, Scissors, Sun } from "lucide-react";
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

const MONTH_LABELS = [
  "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
  "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
];

const MONTH_FULL = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const STAGE_STYLES: Record<SeasonStage["stageType"], {
  bg: string;
  bgHover: string;
  gradient: string;
  icon: typeof Sprout;
  label: string;
  dotColor: string;
}> = {
  planting: {
    bg: "bg-emerald-500",
    bgHover: "hover:bg-emerald-600",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    icon: Sprout,
    label: "Gieo trồng",
    dotColor: "bg-emerald-500",
  },
  care: {
    bg: "bg-sky-500",
    bgHover: "hover:bg-sky-600",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    icon: Sun,
    label: "Chăm sóc",
    dotColor: "bg-sky-500",
  },
  harvest: {
    bg: "bg-amber-500",
    bgHover: "hover:bg-amber-600",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    icon: Scissors,
    label: "Thu hoạch",
    dotColor: "bg-amber-500",
  },
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
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="space-y-3 p-6">
          <div className="grid grid-cols-[200px,1fr] gap-4">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[200px,1fr] gap-4">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!filteredItems.length) {
    return (
      <Card className="border-dashed border-2 border-slate-200">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
          <CalendarDays className="h-10 w-10 text-slate-300" />
          <p className="text-sm text-muted-foreground">
            {filterKeyword
              ? "Không tìm thấy cây trồng phù hợp — thử từ khóa khác."
              : "Chưa có dữ liệu mùa vụ cho vùng này."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div
          className="relative min-w-[1000px]"
          style={{ display: "grid", gridTemplateColumns: "200px repeat(12, minmax(60px, 1fr))" }}
        >
          {/* ── Header row ── */}
          <div className="sticky left-0 z-20 flex items-center gap-2 border-b border-slate-200 bg-slate-800 px-4 py-3">
            <Leaf className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Cây trồng</span>
          </div>
          {MONTHS.map((value) => {
            const isCurrentMonth = value === month;
            return (
              <div
                key={value}
                className={`relative border-b border-slate-200 py-3 text-center transition-colors ${
                  isCurrentMonth
                    ? "bg-sky-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                <div className="text-xs font-bold tracking-wide">{MONTH_LABELS[value - 1]}</div>
                {isCurrentMonth && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                    <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  </div>
                )}
              </div>
            );
          })}

          {/* ── "Today" indicator line ── */}
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-[5]"
            style={{ left: `calc(200px + ((100% - 200px) / 12) * ${month - 0.5})` }}
          >
            <div className="h-full w-[2px] bg-gradient-to-b from-sky-400/80 via-sky-400/40 to-transparent" />
          </div>

          {/* ── Data rows ── */}
          {filteredItems.map(({ item, matchedLocalName }, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0;
            return (
              <div key={item.id} className="contents">
                {/* Crop label cell */}
                <div
                  className={`sticky left-0 z-10 flex min-h-[80px] items-center gap-3 border-b border-slate-100 px-4 text-sm ${
                    isEvenRow ? "bg-white" : "bg-slate-50/80"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{item.crop.name}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays className="h-3 w-3 shrink-0" />
                      <span className="truncate">{item.seasonName}</span>
                    </div>
                    {matchedLocalName ? (
                      <Badge variant="outline" className="mt-1.5 text-[10px] font-normal">
                        {matchedLocalName}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                {/* Timeline cells */}
                <div
                  className={`relative col-span-12 border-b border-slate-100 py-2 ${
                    isEvenRow ? "bg-white" : "bg-slate-50/80"
                  }`}
                >
                  {/* Month grid cells */}
                  <div className="grid h-full grid-cols-12">
                    {MONTHS.map((value) => (
                      <div
                        key={`${item.id}-${value}`}
                        className={`min-h-[64px] border-r border-dashed border-slate-100 last:border-r-0 ${
                          value === month ? "bg-sky-50/50" : ""
                        }`}
                      />
                    ))}
                  </div>

                  {/* Stage bars */}
                  {item.stages
                    .filter((stage) => isStageVisible(stage, stageFilter))
                    .map((stage) => {
                      const style = STAGE_STYLES[stage.stageType];
                      const StageIcon = style.icon;
                      const isHovered = hoveredStageId === stage.id;

                      const spans =
                        stage.startMonth <= stage.endMonth
                          ? [{ start: stage.startMonth, end: stage.endMonth, dashed: false }]
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
                          className={`group absolute top-1/2 flex h-11 -translate-y-1/2 items-center gap-1.5 rounded-xl px-3 text-left text-[13px] font-medium text-white transition-all duration-200 ${
                            isHovered ? "scale-[1.03] shadow-lg ring-2 ring-white/30" : "shadow-md"
                          } ${span.dashed ? "border border-dashed border-white/50" : ""}`}
                          style={{
                            left: `calc(${((span.start - 1) / 12) * 100}% + 3px)`,
                            width: `calc(${((span.end - span.start + 1) / 12) * 100}% - 6px)`,
                            background: style.gradient,
                          }}
                        >
                          <StageIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                          <span className="truncate">{stage.name}</span>

                          {/* Tooltip on hover */}
                          {isHovered && (
                            <div
                              className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 w-80 -translate-x-1/2 animate-in fade-in slide-in-from-top-1 duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-2xl">
                                {/* Tooltip header */}
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="font-semibold text-slate-900">{stage.name}</div>
                                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                      <span className={`inline-block h-2 w-2 rounded-full ${style.dotColor}`} />
                                      <span>{style.label}</span>
                                      <span className="text-slate-300">•</span>
                                      <span>{MONTH_FULL[stage.startMonth - 1]} – {MONTH_FULL[stage.endMonth - 1]}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Description */}
                                {stage.description && (
                                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                                    {stage.description}
                                  </p>
                                )}

                                {/* Care Activities */}
                                {stage.careActivities?.length ? (
                                  <div className="mt-3 border-t border-slate-100 pt-2.5">
                                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                      <Leaf className="h-3 w-3" />
                                      <span>Hoạt động chăm sóc</span>
                                    </div>
                                    <ul className="space-y-1 text-xs text-slate-600">
                                      {stage.careActivities.slice(0, 4).map((activity, i) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                                          <span>{activity}</span>
                                        </li>
                                      ))}
                                      {stage.careActivities.length > 4 && (
                                        <li className="text-xs text-slate-400">
                                          +{stage.careActivities.length - 4} hoạt động khác...
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                ) : null}

                                {/* Pest Warnings */}
                                {stage.pestWarnings?.length ? (
                                  <div className="mt-3 border-t border-slate-100 pt-2.5">
                                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                                      <Bug className="h-3 w-3" />
                                      <span>Cảnh báo sâu bệnh</span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {stage.pestWarnings.slice(0, 3).map((pw, i) => (
                                        <div key={i} className="flex items-center gap-1.5 text-xs">
                                          <Badge
                                            variant="outline"
                                            className={`text-[10px] px-1.5 py-0 ${
                                              pw.severity === "high"
                                                ? "border-red-200 bg-red-50 text-red-700"
                                                : pw.severity === "medium"
                                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                                  : "border-blue-200 bg-blue-50 text-blue-700"
                                            }`}
                                          >
                                            {pw.severity === "high" ? "cao" : pw.severity === "medium" ? "TB" : "thấp"}
                                          </Badge>
                                          <span className="text-slate-600">{pw.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}

                                {/* Click hint */}
                                <div className="mt-3 border-t border-slate-100 pt-2 text-center text-[10px] text-slate-400">
                                  Nhấn để xem chi tiết đầy đủ
                                </div>
                              </div>
                            </div>
                          )}
                        </button>
                      ));
                    })}
                </div>
              </div>
            );
          })}

          {/* ── Workload row ── */}
          {workload.some(Boolean) ? (
            <div className="contents">
              <div className="sticky left-0 z-10 flex items-center border-t-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                Tải công việc
              </div>
              {MONTHS.map((currentMonth) => {
                const entry = workload.find((item) => item?.month === currentMonth);
                return (
                  <div
                    key={`workload-${currentMonth}`}
                    className="flex items-center justify-center border-t-2 border-slate-200 bg-slate-50 py-3"
                  >
                    {entry ? (
                      <Badge className="border border-amber-200 bg-amber-50 text-[11px] font-medium text-amber-700 shadow-sm">
                        {entry.count} cây — {STAGE_STYLES[entry.stageType as keyof typeof STAGE_STYLES]?.label ?? entry.stageType}
                      </Badge>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
