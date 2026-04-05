import { cookies } from "next/headers";
import { Toaster } from "sonner";
import { OfflineIndicator } from "@/components/pos/offline-indicator";
import Link from "next/link";
import { ClockIcon, Package } from "lucide-react";

async function getPosUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("agrix_pos_token")?.value;
  if (!token) return null;

  try {
    const API_BASE = process.env.API_BASE_URL || "http://localhost:3000/api/v1";
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  // Auth is handled by middleware (src/middleware.ts)
  // This layout only renders for authenticated /pos/* routes
  const user = await getPosUser();

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* POS Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-emerald-950 text-white shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Agrix POS</span>
        </div>
        <div className="flex items-center gap-4">
          <OfflineIndicator />
          <Link
            href="/pos/history"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm"
          >
            <ClockIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Lịch sử</span>
          </Link>
          {user && (
            <div className="text-sm text-white/60">
              {user.fullName || user.username}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      <Toaster richColors position="top-center" toastOptions={{ style: { fontSize: '16px', padding: '10px' } }} />
    </div>
  );
}
