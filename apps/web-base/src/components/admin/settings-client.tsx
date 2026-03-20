"use client";

import { useState } from "react";
import { Settings, FolderTree, Ruler, Shield, MoreHorizontal } from "lucide-react";
import { CategoriesClient } from "@/components/admin/categories-client";
import { UnitsClient } from "@/components/admin/units-client";
import { AccountsClient } from "@/components/admin/accounts-client";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; description?: string };
type BaseUnit = { id: string; name: string; abbreviation?: string; description?: string };
type UnitConversion = {
  id: string; productId: string; unitName: string;
  conversionFactor: number; sellPrice: number | null;
  product: { id: string; name: string; baseUnit: string; baseSellPrice: number };
};
type Product = { id: string; name: string; baseUnit: string; baseSellPrice: number };
type AdminUser = {
  id: string; username: string; fullName: string;
  role: string; isActive: boolean; createdAt: string;
};
type Permission = {
  id: string; role: string; module: string;
  canRead: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean;
};

const ALL_TABS = [
  { id: "categories", label: "Danh mục", icon: FolderTree, adminOnly: false },
  { id: "units", label: "Đơn vị", icon: Ruler, adminOnly: false },
  { id: "accounts", label: "Tài khoản", icon: Shield, adminOnly: true },
  { id: "other", label: "Khác", icon: MoreHorizontal, adminOnly: false },
] as const;

export function SettingsClient({
  categories,
  baseUnits,
  conversions,
  products,
  users,
  permissions,
  userRole,
}: {
  categories: Category[];
  baseUnits: BaseUnit[];
  conversions: UnitConversion[];
  products: Product[];
  users: AdminUser[];
  permissions: Permission[];
  userRole: string;
}) {
  const isAdmin = userRole === "ADMIN";
  const visibleTabs = ALL_TABS.filter((t) => !t.adminOnly || isAdmin);
  const [tab, setTab] = useState<string>(visibleTabs[0]?.id || "categories");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
        <Settings className="w-6 h-6" /> Cài đặt
      </h1>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              tab === t.id
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-muted-foreground hover:text-gray-900 hover:border-gray-300"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "categories" && <CategoriesClient categories={categories} />}
      {tab === "units" && <UnitsClient baseUnits={baseUnits} conversions={conversions} products={products} />}
      {tab === "accounts" && isAdmin && <AccountsClient users={users} permissions={permissions} />}
      {tab === "other" && (
        <div className="rounded-xl border bg-card p-8 shadow-sm text-center space-y-3">
          <MoreHorizontal className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">Chưa có cài đặt nào</p>
          <p className="text-xs text-muted-foreground/60">Agrix Admin v2.0.0 (Next.js)</p>
        </div>
      )}
    </div>
  );
}
