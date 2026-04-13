"use client";

import { Droplets, Sprout, Wheat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SeasonCalendarItem, SeasonStage } from "@/lib/admin/season-calendar-api";

type QuickStatsCardsProps = {
  items: SeasonCalendarItem[];
  currentMonth: number;
  activeStageFilter: string;
  loading: boolean;
  onFilterStage: (stageType: string) => void;
};

type StageType = SeasonStage["stageType"];

const CARD_CONFIG: Array<{
  stageType: StageType;
  label: string;
  icon: typeof Sprout;
  tone: string;
}> = [
  {
    stageType: "planting",
    label: "Gieo trồng",
    icon: Sprout,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    stageType: "care",
    label: "Chăm sóc",
    icon: Droplets,
    tone: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    stageType: "harvest",
    label: "Thu hoạch",
    icon: Wheat,
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
];

function stageForMonth(
  stages: SeasonStage[],
  month: number,
): SeasonStage | undefined {
  return stages.find((stage) => {
    if (stage.startMonth <= stage.endMonth) {
      return month >= stage.startMonth && month <= stage.endMonth;
    }
    return month >= stage.startMonth || month <= stage.endMonth;
  });
}

export function QuickStatsCards({
  items,
  currentMonth,
  activeStageFilter,
  loading,
  onFilterStage,
}: QuickStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const counts = CARD_CONFIG.map((config) => ({
    ...config,
    count: items.filter(
      (item) => stageForMonth(item.stages, currentMonth)?.stageType === config.stageType,
    ).length,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {counts.map((item) => {
        const Icon = item.icon;
        const active = activeStageFilter === item.stageType;
        return (
          <button key={item.stageType} type="button" onClick={() => onFilterStage(item.stageType)}>
            <Card
              className={`transition hover:shadow-sm ${item.tone} ${
                active ? "ring-2 ring-offset-2 ring-emerald-500/40" : ""
              }`}
            >
              <CardContent className="flex items-center justify-between pt-6">
                <div className="space-y-1 text-left">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-3xl font-semibold">{item.count}</div>
                </div>
                <Icon className="h-8 w-8" />
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
