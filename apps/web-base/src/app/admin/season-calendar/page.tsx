"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, CalendarDays, Database, Layers3, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CropSearchInput } from "./components/CropSearchInput";
import { QuickStatsCards } from "./components/QuickStatsCards";
import { SeasonCalendarGrid } from "./components/SeasonCalendarGrid";
import { SeasonCalendarTimeline } from "./components/SeasonCalendarTimeline";
import { StageDetailSheet } from "./components/StageDetailSheet";
import { WeatherOverlay } from "./components/WeatherOverlay";
import { ZoneSelector } from "./components/ZoneSelector";
import {
  fetchCalendar,
  fetchCrops,
  fetchWeather,
  fetchZones,
  type SeasonCalendarItem,
  type SeasonCalendarResponse,
  type SeasonCrop,
  type SeasonStage,
  type SeasonZone,
  type WeatherResponse,
} from "@/lib/admin/season-calendar-api";

type ViewMode = "grid" | "table" | "timeline";

type ActiveStage = {
  calendar: SeasonCalendarItem;
  stage: SeasonStage;
} | null;

export default function SeasonCalendarPage() {
  const currentMonth = new Date().getMonth() + 1;
  const [zones, setZones] = useState<SeasonZone[]>([]);
  const [crops, setCrops] = useState<SeasonCrop[]>([]);
  const [calendar, setCalendar] = useState<SeasonCalendarResponse | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedCropId, setSelectedCropId] = useState("all");
  const [cropFilter, setCropFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [weatherEnabled, setWeatherEnabled] = useState(false);
  const [overlayMode, setOverlayMode] = useState(false);
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState<ActiveStage>(null);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const zoneData = await fetchZones();
        if (!active) return;
        setZones(zoneData);
        if (zoneData[0]) {
          setSelectedZoneId(zoneData[0].id);
        }
      } catch {
        if (active) {
          toast.error("Không tải được danh sách vùng");
        }
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  async function loadCalendar(zoneId: string, month: number, cropId?: string) {
    if (!zoneId) return;
    setLoading(true);
    try {
      const [cropData, calendarData] = await Promise.all([
        fetchCrops(zoneId),
        fetchCalendar(zoneId, month, cropId && cropId !== "all" ? cropId : undefined),
      ]);
      setCrops(cropData);
      setCalendar(calendarData);
    } catch {
      toast.error("Không tải được lịch mùa vụ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedZoneId) return;
    void loadCalendar(selectedZoneId, selectedMonth, selectedCropId);
  }, [selectedCropId, selectedMonth, selectedZoneId]);

  useEffect(() => {
    if (!selectedZoneId || !weatherEnabled) {
      setWeather(null);
      setWeatherLoading(false);
      return;
    }

    setWeatherLoading(true);
    fetchWeather(selectedZoneId)
      .then(setWeather)
      .catch(() => {
        setWeather(null);
        toast.error("Không tải được dữ liệu thời tiết");
      })
      .finally(() => {
        setWeatherLoading(false);
      });
  }, [selectedZoneId, weatherEnabled]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        (calendar?.items ?? [])
          .map((item) => item.crop.category ?? "Khác")
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right, "vi"));
  }, [calendar?.items]);

  const filteredItems = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return (calendar?.items ?? []).filter((item) => {
      const categoryMatch =
        cropFilter === "all" || (item.crop.category ?? "Khác") === cropFilter;
      const stageMatch =
        stageFilter === "all" ||
        item.stages.some((stage) => stage.stageType === stageFilter);
      const keywordMatch =
        !keyword ||
        item.crop.name.toLowerCase().includes(keyword) ||
        item.crop.localNames?.some((name) => name.toLowerCase().includes(keyword));
      return categoryMatch && stageMatch && keywordMatch;
    });
  }, [calendar?.items, cropFilter, searchKeyword, stageFilter]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border bg-[linear-gradient(135deg,#ecfdf5_0%,#f8fafc_42%,#eff6ff_100%)] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-emerald-700">
              <CalendarDays className="h-3.5 w-3.5" />
              Agricultural Season Calendar
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Lịch mùa vụ theo vùng, cây trồng và giai đoạn sinh trưởng
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Theo dõi lịch canh tác theo tháng, chuyển sang timeline để so sánh mùa vụ
                và mở sheet chi tiết để xem checklist chăm sóc, sâu bệnh và gợi ý sản phẩm.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/season-calendar/zones">Quản lý vùng</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/season-calendar/manage">
                <Database className="mr-2 h-4 w-4" />
                Quản lý dữ liệu
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/season-calendar/activity-log">
                <Activity className="mr-2 h-4 w-4" />
                Nhật ký
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/season-calendar/crops">
                Quản lý cây trồng
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.25fr,0.8fr,0.8fr]">
        <div className="space-y-2">
          <Label>Vùng nông nghiệp</Label>
          <ZoneSelector
            zones={zones}
            value={selectedZoneId}
            onChange={(value) => {
              setSelectedZoneId(value);
              setSelectedCropId("all");
              setSelectedCropIds([]);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Tháng</Label>
          <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <SelectItem key={month} value={String(month)}>
                  Tháng {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Cây trồng</Label>
          <Select value={selectedCropId} onValueChange={setSelectedCropId}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Tất cả cây trồng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cây trồng</SelectItem>
              {crops.map((crop) => (
                <SelectItem key={crop.id} value={crop.id}>
                  {crop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Vùng đang xem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {calendar?.zone.name ?? "Chưa chọn vùng"}
            </div>
            <div className="text-sm text-muted-foreground">
              Mã vùng: {calendar?.zone.code ?? "--"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={overlayMode}
                onCheckedChange={(checked) => {
                  const next = Boolean(checked);
                  setOverlayMode(next);
                  if (!next) {
                    setSelectedCropIds([]);
                  }
                }}
              />
              <div>
                <div className="font-medium">Overlay nhiều cây trồng</div>
                <div className="text-sm text-muted-foreground">
                  Chọn nhiều crop để so sánh trên timeline
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={weatherEnabled}
                onCheckedChange={(checked) => setWeatherEnabled(Boolean(checked))}
              />
              <div>
                <div className="font-medium">Lớp dữ liệu thời tiết</div>
                <div className="text-sm text-muted-foreground">
                  Hiển thị lượng mưa và nhiệt độ trung bình 12 tháng
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="text-sm font-medium">Từ khóa cây trồng</div>
            <CropSearchInput value={searchKeyword} onChange={setSearchKeyword} />
            <div className="flex items-center gap-2 rounded-full bg-muted p-1">
              {(["grid", "table", "timeline"] as ViewMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <QuickStatsCards
        items={filteredItems}
        currentMonth={selectedMonth}
        activeStageFilter={stageFilter}
        loading={loading}
        onFilterStage={(nextStageType) =>
          setStageFilter((current) => (current === nextStageType ? "all" : nextStageType))
        }
      />

      {overlayMode && viewMode === "timeline" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers3 className="h-4 w-4 text-sky-600" />
              Chọn cây trồng để overlay
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {crops.map((crop) => (
              <label key={crop.id} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
                <Checkbox
                  checked={selectedCropIds.includes(crop.id)}
                  onCheckedChange={(checked) =>
                    setSelectedCropIds((current) =>
                      checked ? [...current, crop.id] : current.filter((id) => id !== crop.id),
                    )
                  }
                />
                <span>{crop.name}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {viewMode === "timeline" ? (
        <SeasonCalendarTimeline
          items={filteredItems}
          month={selectedMonth}
          filterKeyword={searchKeyword}
          stageFilter={stageFilter}
          loading={loading}
          overlayMode={overlayMode}
          selectedCropIds={selectedCropIds}
          onStageSelect={setActiveStage}
        />
      ) : (
        <SeasonCalendarGrid
          items={filteredItems}
          loading={loading}
          month={selectedMonth}
          zoneId={selectedZoneId}
          categories={categories}
          cropFilter={cropFilter}
          stageFilter={stageFilter}
          filterKeyword={searchKeyword}
          viewMode={viewMode}
          onCropFilterChange={setCropFilter}
          onStageFilterChange={setStageFilter}
          onViewModeChange={setViewMode}
          onOpenStage={setActiveStage}
          onRefresh={() => loadCalendar(selectedZoneId, selectedMonth, selectedCropId)}
        />
      )}

      {weatherEnabled ? (
        <WeatherOverlay
          weatherData={weather?.months ?? []}
          loading={weatherLoading}
          zoneName={weather?.zoneName}
        />
      ) : null}

      <StageDetailSheet
        calendar={activeStage?.calendar ?? null}
        stage={activeStage?.stage ?? null}
        zoneId={selectedZoneId}
        month={selectedMonth}
        open={Boolean(activeStage)}
        onClose={() => setActiveStage(null)}
      />
    </div>
  );
}
