"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  FileText,
  Settings,
  Warehouse,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Permission = {
  module: string;
  canRead: boolean;
};

// Map sidebar items to permission modules
const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, module: null },
  { href: "/admin/inventory", label: "Kho hàng", icon: Warehouse, module: "products" },
  { href: "/admin/orders", label: "Đơn hàng", icon: ClipboardList, module: "orders" },
  { href: "/admin/customers", label: "Khách hàng", icon: Users, module: "customers" },
  { href: "/admin/blog", label: "Blog", icon: FileText, module: "blog" },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings, module: "settings" },
];

export function AdminSidebar({
  role,
  permissions,
}: {
  role: string;
  permissions: Permission[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  // ADMIN sees everything; other roles filtered by canRead
  const visibleItems = navItems.filter((item) => {
    if (!item.module) return true; // Tổng quan always visible
    if (role === "ADMIN") return true;
    const perm = permissions.find((p) => p.module === item.module);
    return perm?.canRead ?? false;
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-56 min-h-screen bg-emerald-950 text-white flex flex-col">
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">Agrix Admin</span>
      </div>
      <div className="h-px bg-white/10" />
      <nav className="flex-1 py-2 px-2 space-y-1">
        {visibleItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 pb-4">
        <div className="h-px bg-white/10 mb-2" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
