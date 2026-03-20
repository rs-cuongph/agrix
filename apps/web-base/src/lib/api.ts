import { getToken } from "./auth";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000/api/v1";

type FetchOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const token = opts.token || (await getToken());
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// Convenience methods
export const apiGet = <T>(path: string, token?: string) =>
  apiFetch<T>(path, { token });

export const apiPost = <T>(path: string, body: unknown, token?: string) =>
  apiFetch<T>(path, { method: "POST", body, token });

export const apiPut = <T>(path: string, body: unknown, token?: string) =>
  apiFetch<T>(path, { method: "PUT", body, token });

export const apiDelete = <T>(path: string, token?: string) =>
  apiFetch<T>(path, { method: "DELETE", token });

export const apiPatch = <T>(path: string, body?: unknown, token?: string) =>
  apiFetch<T>(path, { method: "PATCH", body, token });

// Type helpers for paginated responses
export type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number };
};
