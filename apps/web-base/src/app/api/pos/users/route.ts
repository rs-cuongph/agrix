import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000/api/v1";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/auth/pos-users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch pos users" }, { status: 500 });
  }
}
