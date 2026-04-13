"use client";

export type SeasonZone = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  provinces?: string[];
};

export type SeasonCrop = {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  localNames?: string[];
};

export type SeasonRecommendation = {
  id: string;
  productId: string;
  reason?: string | null;
  priority: number;
  dosageNote?: string | null;
  product?: {
    id: string;
    name: string;
    sku: string;
    baseUnit: string;
    baseSellPrice: number;
    currentStockBase: number;
  } | null;
};

export type SeasonPestWarning = {
  id: string;
  name: string;
  symptoms?: string | null;
  severity: "low" | "medium" | "high";
  preventionNote?: string | null;
  treatmentProducts: Array<{
    productId: string;
    productName: string;
    productSku: string;
    usageNote?: string | null;
  }>;
};

export type SeasonStage = {
  id: string;
  name: string;
  stageType: "planting" | "care" | "harvest";
  startMonth: number;
  endMonth: number;
  description?: string | null;
  keywords?: string[];
  careActivities?: string[];
  sortOrder: number;
  pestWarnings?: SeasonPestWarning[];
  recommendations?: SeasonRecommendation[];
};

export type SeasonCalendarItem = {
  id: string;
  seasonName: string;
  year?: number | null;
  notes?: string | null;
  zone: SeasonZone;
  crop: SeasonCrop;
  currentStage?: {
    id: string;
    name: string;
    stageType: "planting" | "care" | "harvest";
    description?: string | null;
  } | null;
  stages: SeasonStage[];
};

export type SeasonCalendarResponse = {
  zone: SeasonZone;
  month: number | null;
  items: SeasonCalendarItem[];
  suggestedZones?: SeasonZone[];
};

export type WeatherMonth = {
  month: number;
  avgTempC: number;
  avgRainfallMm: number;
  notes?: string | null;
};

export type WeatherResponse = {
  zoneId: string;
  zoneName: string;
  months: WeatherMonth[];
};

export type ActivityLogItem = {
  id: string;
  actorId: string;
  actorName: string;
  action: "create" | "update" | "delete";
  entityType: string;
  entityId: string;
  entityName: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type ActivityLogResponse = {
  items: ActivityLogItem[];
  total: number;
  page: number;
  limit: number;
};

export type SuggestionResponse = {
  context: {
    zone: string;
    crop: string;
    stage: string;
    month: number;
  };
  explanation: string;
  products: Array<{
    id: string;
    name: string;
    sku: string;
    baseSellPrice: number;
    baseUnit: string;
    currentStockBase: number;
    reason?: string | null;
    dosageNote?: string | null;
    priority: number;
  }>;
  alternatives?: Array<{
    id: string;
    name: string;
    sku: string;
    baseSellPrice: number;
    baseUnit: string;
    currentStockBase: number;
  }>;
};

async function proxyGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api/admin/proxy?path=${encodeURIComponent(path)}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export async function fetchZones() {
  return proxyGet<SeasonZone[]>("/season-calendar/zones");
}

export async function fetchCrops(zoneId?: string) {
  const suffix = zoneId ? `?zoneId=${encodeURIComponent(zoneId)}` : "";
  return proxyGet<SeasonCrop[]>(`/season-calendar/crops${suffix}`);
}

export async function fetchCalendar(
  zoneId: string,
  month?: number,
  cropId?: string,
) {
  const params = new URLSearchParams({ zoneId });
  if (month) params.set("month", String(month));
  if (cropId) params.set("cropId", cropId);
  return proxyGet<SeasonCalendarResponse>(
    `/season-calendar/calendar?${params.toString()}`,
  );
}

export async function fetchSuggestions(
  zoneId: string,
  month: number,
  cropId: string,
  stageId?: string,
) {
  const params = new URLSearchParams({
    zoneId,
    month: String(month),
    cropId,
  });
  if (stageId) params.set("stageId", stageId);
  return proxyGet<SuggestionResponse>(
    `/season-calendar/suggest?${params.toString()}`,
  );
}

export async function fetchWeather(zoneId: string) {
  return proxyGet<WeatherResponse>(
    `/season-calendar/weather?zoneId=${encodeURIComponent(zoneId)}`,
  );
}

export async function fetchActivityLog(params: {
  page: number;
  limit: number;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const search = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.entityType && params.entityType !== "all") {
    search.set("entityType", params.entityType);
  }
  if (params.fromDate) {
    search.set("fromDate", params.fromDate);
  }
  if (params.toDate) {
    search.set("toDate", params.toDate);
  }
  return proxyGet<ActivityLogResponse>(
    `/admin/season-calendar/activity-log?${search.toString()}`,
  );
}
