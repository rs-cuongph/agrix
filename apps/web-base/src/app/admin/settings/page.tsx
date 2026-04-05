import { apiGet, type PaginatedResponse } from "@/lib/api";
import { SettingsClient } from "@/components/admin/settings-client";

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
  posPin?: string | null;
};
type StoreSettings = {
  bankBin?: string | null;
  bankAccountNo?: string | null;
  bankAccountName?: string | null;
};
type Permission = {
  id: string; role: string; module: string;
  canRead: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean;
};

export default async function SettingsPage() {
  let categories: Category[] = [];
  let baseUnits: BaseUnit[] = [];
  let conversions: UnitConversion[] = [];
  let products: Product[] = [];
  let users: AdminUser[] = [];
  let permissions: Permission[] = [];
  let userRole = "";
  let storeSettings: StoreSettings = {};

  try {
    const [catRes, unitRes, convRes, prodRes, meRes] = await Promise.all([
      apiGet<Category[]>("/categories"),
      apiGet<BaseUnit[]>("/units"),
      apiGet<UnitConversion[]>("/unit-conversions"),
      apiGet<PaginatedResponse<Product>>("/products"),
      apiGet<{ role: string }>("/auth/me"),
    ]);
    categories = catRes;
    baseUnits = unitRes;
    conversions = convRes;
    products = prodRes.data;
    userRole = meRes.role;

    if (userRole === "ADMIN") {
      const [userRes, permRes, settingsRes] = await Promise.all([
        apiGet<AdminUser[]>("/admin-users"),
        apiGet<Permission[]>("/admin-users/permissions"),
        apiGet<StoreSettings>("/admin/settings"),
      ]);
      users = userRes;
      permissions = permRes;
      storeSettings = settingsRes ?? {};
    }
  } catch (e) {
    console.error("Settings data fetch error:", e);
  }

  return (
    <SettingsClient
      categories={categories}
      baseUnits={baseUnits}
      conversions={conversions}
      products={products}
      users={users}
      permissions={permissions}
      userRole={userRole}
      storeSettings={storeSettings}
    />
  );
}
