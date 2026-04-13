"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  FileText,
  Settings,
  Warehouse,
  LogOut,
  Bot,
  MessageSquare,
  HelpCircle,
  Star,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Store,
  AppWindow,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Permission = {
  module: string;
  canRead: boolean;
};

// Represents a child item under a menu group
interface NavItemChild {
  href: string;
  label: string;
  icon: React.ElementType;
  module: string | null;
}

// Represents either a standalone link or a group with children
interface NavItemGroup {
  label: string;
  icon?: React.ElementType; // Icon for the group (optional)
  href?: string; // Optional: only if standalone
  module?: string | null;
  children?: NavItemChild[];
}

// Grouped Structure
const navItems: NavItemGroup[] = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, module: null },
  {
    label: "Cửa hàng",
    icon: Store,
    children: [
      {
        href: "/admin/orders",
        label: "Đơn hàng",
        icon: ClipboardList,
        module: "orders",
      },
      {
        href: "/admin/customers",
        label: "Khách hàng",
        icon: Users,
        module: "customers",
      },
      {
        href: "/admin/inventory",
        label: "Kho hàng",
        icon: Warehouse,
        module: "products",
      },
      {
        href: "/admin/testimonials",
        label: "Đánh giá",
        icon: Star,
        module: "settings",
      },
    ],
  },
  {
    label: "Nội dung / Web",
    icon: AppWindow,
    children: [
      { href: "/admin/blog", label: "Blog", icon: FileText, module: "blog" },
      {
        href: "/admin/faq",
        label: "FAQ",
        icon: HelpCircle,
        module: "settings",
      },
      {
        href: "/admin/contacts",
        label: "Liên hệ",
        icon: MessageSquare,
        module: "settings",
      },
      {
        href: "/admin/season-calendar",
        label: "Lịch Mùa vụ",
        icon: CalendarDays,
        module: "settings",
      },
    ],
  },
  {
    label: "Hệ thống",
    icon: Settings,
    children: [
      {
        href: "/admin/settings",
        label: "Cài đặt",
        icon: Settings,
        module: "settings",
      },
      {
        href: "/admin/ai-assistant",
        label: "Trợ lý AI",
        icon: Bot,
        module: "settings",
      },
    ],
  },
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

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Track if we've auto-expanded once on mount so we don't aggressively keep it open if user collapses it
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);

  useEffect(() => {
    if (!hasAutoExpanded) {
      // Find which group contains the active child route
      for (const group of navItems) {
        if (group.children) {
          const isChildActive = group.children.some(
            (child) =>
              pathname === child.href ||
              (child.href !== "/admin" && pathname.startsWith(child.href)),
          );
          if (isChildActive) {
            setExpandedGroups((prev) =>
              Array.from(new Set([...prev, group.label])),
            );
          }
        }
      }
      setHasAutoExpanded(true);
    }
  }, [pathname, hasAutoExpanded]);

  // Check if a group is allowed to be visible
  // A group is visible if it's standalone and allowed, or if it has at least one visible child
  const getVisibleGroupChildren = (children?: NavItemChild[]) => {
    if (!children) return [];
    return children.filter((child) => {
      if (!child.module) return true;
      if (role === "ADMIN") return true;
      const perm = permissions.find((p) => p.module === child.module);
      return perm?.canRead ?? false;
    });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupLabel)
        ? prev.filter((label) => label !== groupLabel)
        : [...prev, groupLabel],
    );
  };

  return (
    <aside className="w-64 min-h-screen bg-emerald-950 text-white flex flex-col transition-all duration-300 flex-shrink-0">
      <div className="p-5 flex items-center gap-3">
        <div className="shrink-0 w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight truncate">
          Agrix Admin
        </span>
      </div>
      <div className="h-px bg-white/10" />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 scrollbar-thin scrollbar-thumb-emerald-800 scrollbar-track-transparent">
        {navItems.map((group) => {
          if (!group.children && group.href) {
            // Standalone item
            if (group.module && role !== "ADMIN") {
              const perm = permissions.find((p) => p.module === group.module);
              if (!perm?.canRead) return null;
            }

            const active = pathname === group.href;

            return (
              <Link
                key={group.label}
                href={group.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm transition-colors outline-none",
                  active
                    ? "bg-white/15 text-white font-semibold"
                    : "text-white/70 hover:bg-white/10 focus-visible:bg-white/10 hover:text-white focus-visible:text-white",
                )}
              >
                {group.icon && (
                  <group.icon
                    className={cn(
                      "shrink-0 w-5 h-5",
                      active ? "text-emerald-400" : "",
                    )}
                  />
                )}
                <span className="truncate">{group.label}</span>
              </Link>
            );
          } else if (group.children) {
            // Group with children
            const visibleChildren = getVisibleGroupChildren(group.children);
            if (visibleChildren.length === 0) return null; // Hide entire group if no children accessible

            const isExpanded = expandedGroups.includes(group.label);

            // Check if any child is currently active to visually highlight the group header slightly
            const isAnyChildActive = visibleChildren.some(
              (child) =>
                pathname === child.href ||
                (child.href !== "/admin" && pathname.startsWith(child.href)),
            );

            return (
              <div key={group.label} className="mb-2">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-all outline-none",
                    isAnyChildActive
                      ? "text-white font-medium"
                      : "text-white/70 hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white",
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {group.icon && (
                      <group.icon
                        className={cn(
                          "shrink-0 w-5 h-5",
                          isAnyChildActive ? "text-emerald-400" : "",
                        )}
                      />
                    )}
                    <span className="truncate">{group.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 shrink-0 opacity-70" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0 opacity-70" />
                  )}
                </button>

                {/* Collapsible Children */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isExpanded
                      ? "grid-rows-[1fr] opacity-100 mt-1"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="pl-[2.75rem] py-1 space-y-1">
                      {visibleChildren.map((child) => {
                        const active =
                          pathname === child.href ||
                          (child.href !== "/admin" &&
                            pathname.startsWith(child.href));
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors outline-none",
                              active
                                ? "bg-white/15 text-white font-semibold"
                                : "text-white/60 hover:bg-white/10 focus-visible:bg-white/10 hover:text-white focus-visible:text-white",
                            )}
                          >
                            <span
                              className={cn(
                                "truncate relative before:content-[''] before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-white/20",
                                active && "before:bg-emerald-400",
                              )}
                            >
                              {child.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="p-3 bg-emerald-950 mt-auto">
        <div className="h-px bg-white/10 mb-3" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors w-full focus-visible:bg-white/10 outline-none"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="truncate">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
