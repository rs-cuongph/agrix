import { apiGet } from "@/lib/api";
import { AccountsClient } from "@/components/admin/accounts-client";

type AdminUser = {
  id: string; username: string; fullName: string;
  role: string; isActive: boolean; createdAt: string;
};

type Permission = {
  id: string; role: string; module: string;
  canRead: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean;
};

export default async function AccountsPage() {
  let users: AdminUser[] = [];
  let permissions: Permission[] = [];
  try {
    [users, permissions] = await Promise.all([
      apiGet<AdminUser[]>("/admin-users"),
      apiGet<Permission[]>("/admin-users/permissions"),
    ]);
  } catch (e) {
    console.error("Accounts fetch error:", e);
  }

  return <AccountsClient users={users} permissions={permissions} />;
}
