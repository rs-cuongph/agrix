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
    <aside className="flex min-h-screen w-72 shrink-0 flex-col border-r border-emerald-900/20 bg-[linear-gradient(180deg,#052e2b_0%,#064e3b_18%,#062f4f_100%)] text-white shadow-[20px_0_60px_-35px_rgba(15,23,42,0.6)] transition-all duration-300">
      <div className="p-5">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400 shadow-lg shadow-emerald-500/20">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">
              Control Center
            </p>
            <span className="block truncate text-lg font-semibold tracking-tight text-white">
              Agrix Admin
            </span>
          </div>
        </div>
      </div>
      <div className="h-px bg-white/10" />

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 scrollbar-thin scrollbar-thumb-emerald-800 scrollbar-track-transparent">
        <div className="space-y-1">
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
                  "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors outline-none",
                  active
                    ? "bg-white/14 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
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
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-all outline-none",
                    isAnyChildActive
                      ? "bg-white/8 text-white"
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
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors outline-none",
                              active
                                ? "bg-white/14 text-white"
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
      </div>

      <div className="mt-auto p-3">
        <div className="mb-3 h-px bg-white/10" />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:bg-white/10"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="truncate">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
