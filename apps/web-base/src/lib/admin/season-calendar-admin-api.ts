"use client";

import { adminApiCall } from "@/components/admin/crud-dialog";

export type ProductOption = {
  id: string;
  name: string;
  sku: string;
  baseUnit: string;
  baseSellPrice: number;
  currentStockBase: number;
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
