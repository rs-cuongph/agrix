import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000/api/v1";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  if (!pin) return NextResponse.json({ error: "PIN required" }, { status: 400 });

  const res = await fetch(`${API_BASE}/auth/pos-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const response = NextResponse.json({ ok: true, user: data.user });
  response.cookies.set("agrix_pos_token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 16, // 16 hours
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("agrix_pos_token");
  return response;
}
