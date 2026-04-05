import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin/* (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("agrix_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect /pos/* (except /pos/login)
  if (pathname.startsWith("/pos") && !pathname.startsWith("/pos/login")) {
    const posToken = request.cookies.get("agrix_pos_token")?.value;
    if (!posToken) {
      return NextResponse.redirect(new URL("/pos/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pos", "/pos/:path*"],
};
