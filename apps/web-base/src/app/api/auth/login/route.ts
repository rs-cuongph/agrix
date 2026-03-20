import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const API_BASE = process.env.API_BASE_URL || "http://localhost:3000/api/v1";

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Login failed" },
      { status: res.status }
    );
  }

  const data = await res.json();
  const token = data.accessToken;

  const response = NextResponse.json({
    user: data.user,
    success: true,
  });

  response.cookies.set("agrix_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
