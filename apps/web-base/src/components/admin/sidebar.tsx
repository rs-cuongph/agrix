"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Ruler,
  ClipboardList,
  Users,
  FileText,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/units", label: "Đơn vị", icon: Ruler },
  { href: "/admin/orders", label: "Đơn hàng", icon: ClipboardList },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/accounts", label: "Tài khoản", icon: Shield },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

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
        {navItems.map((item) => {
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
    </aside>
  );
}
