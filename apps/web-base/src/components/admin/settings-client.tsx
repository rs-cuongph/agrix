"use client";

import { Settings, FolderTree, Ruler, Shield, MoreHorizontal } from "lucide-react";
import { CategoriesClient } from "@/components/admin/categories-client";
import { UnitsClient } from "@/components/admin/units-client";
import { AccountsClient } from "@/components/admin/accounts-client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
        <Settings className="w-6 h-6" /> Cài đặt
      </h1>

      <Tabs defaultValue={visibleTabs[0]?.id || "categories"}>
        <TabsList>
          {visibleTabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-1.5">
              <t.icon className="w-4 h-4" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="categories">
          <CategoriesClient categories={categories} />
        </TabsContent>
        <TabsContent value="units">
          <UnitsClient baseUnits={baseUnits} conversions={conversions} products={products} />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="accounts">
            <AccountsClient users={users} permissions={permissions} />
          </TabsContent>
        )}
        <TabsContent value="other">
          <div className="rounded-xl border bg-card p-8 shadow-sm text-center space-y-3">
            <MoreHorizontal className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">Chưa có cài đặt nào</p>
            <p className="text-xs text-muted-foreground/60">Agrix Admin v2.0.0 (Next.js)</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
