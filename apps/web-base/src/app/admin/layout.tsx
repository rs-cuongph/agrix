import { cookies } from "next/headers";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "sonner";

type Permission = {
  module: string;
  canRead: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean;
};

type UserInfo = {
  role: string;
  permissions: Permission[];
};

async function getUser(): Promise<UserInfo | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("agrix_token")?.value;
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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // Not authenticated — render without sidebar (login page)
  if (!user) {
    return (
      <div className="admin-scope">
        {children}
        <Toaster richColors position="top-right" toastOptions={{ style: { fontSize: '16px', padding: '10px' } }} />
      </div>
    );
  }

  return (
    <div className="admin-scope flex min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_26%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_24%),#f8fafc]">
      <AdminSidebar role={user.role} permissions={user.permissions} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto flex min-h-screen w-full flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 2xl:px-8">
          {children}
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
