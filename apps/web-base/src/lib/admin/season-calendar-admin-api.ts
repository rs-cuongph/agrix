"use client";

import { adminApiCall } from "@/components/admin/crud-dialog";
import type {
  SeasonCrop,
  SeasonPestWarning,
  SeasonRecommendation,
  SeasonStage,
  SeasonZone,
} from "@/lib/admin/season-calendar-api";

export type ProductOption = {
  id: string;
  name: string;
  sku: string;
  baseUnit: string;
  baseSellPrice: number;
  currentStockBase: number;
};

export type CalendarListItem = {
  id: string;
  seasonName: string;
  year?: number | null;
  notes?: string | null;
  isActive: boolean;
  zone: Pick<SeasonZone, "id" | "name" | "code"> | null;
  crop: Pick<SeasonCrop, "id" | "name" | "category"> | null;
  stageCount: number;
  createdAt: string;
};

export type CalendarListResponse = {
  items: CalendarListItem[];
  total: number;
};

export type CalendarDetail = {
  id: string;
  seasonName: string;
  year?: number | null;
  notes?: string | null;
  isActive: boolean;
  zone: Pick<SeasonZone, "id" | "name" | "code"> | null;
  crop: Pick<SeasonCrop, "id" | "name" | "category"> | null;
  stages: Array<
    Omit<SeasonStage, "pestWarnings" | "recommendations"> & {
      recommendations: SeasonRecommendation[];
      pestWarnings: SeasonPestWarning[];
    }
  >;
  createdAt: string;
};

export type AiPreviewWarning = {
  name: string;
  severity: "low" | "medium" | "high";
  symptoms?: string;
  preventionNote?: string;
};

export type AiPreviewStage = {
  name: string;
  stageType: "planting" | "care" | "harvest";
  startMonth: number;
  endMonth: number;
  description?: string;
  keywords?: string[];
  careActivities?: string[];
  sortOrder?: number;
  pestWarnings?: AiPreviewWarning[];
};

export type AiPreviewSeason = {
  seasonName: string;
  notes?: string;
  stages: AiPreviewStage[];
};

export type AiGenerateResult = {
  seasons: AiPreviewSeason[];
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

export async function fetchAdminProducts() {
  const response = await proxyGet<{ data?: ProductOption[] } | ProductOption[]>(
    "/products?limit=200",
  );
  return Array.isArray(response) ? response : (response.data ?? []);
}

export async function listCalendars(filters?: {
  zoneId?: string;
  cropId?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.zoneId && filters.zoneId !== "all") {
    params.set("zoneId", filters.zoneId);
  }
  if (filters?.cropId && filters.cropId !== "all") {
    params.set("cropId", filters.cropId);
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return proxyGet<CalendarListResponse>(
    `/admin/season-calendar/calendars${suffix}`,
  );
}

export async function getCalendarDetail(id: string) {
  return proxyGet<CalendarDetail>(`/admin/season-calendar/calendars/${id}`);
}

export async function aiGenerateCalendar(body: {
  zoneId: string;
  cropId: string;
  userNotes?: string;
}) {
  return adminApiCall(
    "/admin/season-calendar/ai-generate",
    "POST",
    body,
  ) as Promise<AiGenerateResult>;
}

export async function bulkCreateCalendars(body: {
  zoneId: string;
  cropId: string;
  replaceExisting?: boolean;
  seasons: AiPreviewSeason[];
}) {
  return adminApiCall(
    "/admin/season-calendar/bulk-create",
    "POST",
    body,
  ) as Promise<{
    calendarsCreated: number;
    stagesCreated: number;
    pestWarningsCreated: number;
    message: string;
  }>;
}

export async function checkExistingCalendars(zoneId: string, cropId: string) {
  const params = new URLSearchParams({ zoneId, cropId });
  return proxyGet<{ count: number }>(
    `/admin/season-calendar/calendars/check-existing?${params.toString()}`,
  );
}

export async function createZone(body: Record<string, unknown>) {
  return adminApiCall("/admin/season-calendar/zones", "POST", body);
}

export async function updateZone(id: string, body: Record<string, unknown>) {
  return adminApiCall(`/admin/season-calendar/zones/${id}`, "PATCH", body);
}

export async function deleteZone(id: string) {
  return adminApiCall(`/admin/season-calendar/zones/${id}`, "DELETE");
}

export async function createCrop(body: Record<string, unknown>) {
  return adminApiCall("/admin/season-calendar/crops", "POST", body);
}

export async function updateCrop(id: string, body: Record<string, unknown>) {
  return adminApiCall(`/admin/season-calendar/crops/${id}`, "PATCH", body);
}

export async function deleteCrop(id: string) {
  return adminApiCall(`/admin/season-calendar/crops/${id}`, "DELETE");
}

export async function createCalendar(body: Record<string, unknown>) {
  return adminApiCall("/admin/season-calendar/calendars", "POST", body);
}

export async function updateCalendar(
  id: string,
  body: Record<string, unknown>,
) {
  return adminApiCall(`/admin/season-calendar/calendars/${id}`, "PATCH", body);
}

export async function deleteCalendar(id: string) {
  return adminApiCall(`/admin/season-calendar/calendars/${id}`, "DELETE");
}

export async function addStage(
  calendarId: string,
  body: Record<string, unknown>,
) {
  return adminApiCall(
    `/admin/season-calendar/calendars/${calendarId}/stages`,
    "POST",
    body,
  );
}

export async function updateStage(id: string, body: Record<string, unknown>) {
  return adminApiCall(`/admin/season-calendar/stages/${id}`, "PATCH", body);
}

export async function deleteStage(id: string) {
  return adminApiCall(`/admin/season-calendar/stages/${id}`, "DELETE");
}

export async function addRecommendation(
  stageId: string,
  body: Record<string, unknown>,
) {
  return adminApiCall(
    `/admin/season-calendar/stages/${stageId}/recommendations`,
    "POST",
    body,
  );
}

export async function deleteRecommendation(id: string) {
  return adminApiCall(`/admin/season-calendar/recommendations/${id}`, "DELETE");
}

export async function fetchPestWarnings(stageId: string) {
  return proxyGet(`/admin/season-calendar/stages/${stageId}/pest-warnings`);
}

export async function createPestWarning(
  stageId: string,
  body: Record<string, unknown>,
) {
  return adminApiCall(
    `/admin/season-calendar/stages/${stageId}/pest-warnings`,
    "POST",
    body,
  );
}

export async function updatePestWarning(
  id: string,
  body: Record<string, unknown>,
) {
  return adminApiCall(`/admin/season-calendar/pest-warnings/${id}`, "PATCH", body);
}

export async function deletePestWarning(id: string) {
  return adminApiCall(`/admin/season-calendar/pest-warnings/${id}`, "DELETE");
}

export async function createOrUpdateWeather(body: Record<string, unknown>) {
  return adminApiCall("/admin/season-calendar/weather", "POST", body);
}

export async function deleteWeather(id: string) {
  return adminApiCall(`/admin/season-calendar/weather/${id}`, "DELETE");
}
