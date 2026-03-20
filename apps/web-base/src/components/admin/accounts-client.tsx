"use client";

import { useState } from "react";
import { Shield, Plus, Pencil, Power, Key } from "lucide-react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string; username: string; fullName: string;
  role: string; isActive: boolean; createdAt: string;
};

type Permission = {
  id: string; role: string; module: string;
  canRead: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean;
};

const MODULES = ["products", "orders", "customers", "blog", "settings", "units"];
const MODULE_LABELS: Record<string, string> = {
  products: "Sản phẩm", orders: "Đơn hàng", customers: "Khách hàng",
  blog: "Blog", settings: "Cài đặt", units: "Đơn vị",
};

const userFields = [
  { name: "username", label: "Tên đăng nhập", required: true },
  { name: "password", label: "Mật khẩu", required: true, placeholder: "Tối thiểu 6 ký tự" },
  { name: "fullName", label: "Họ tên", required: true },
  { name: "role", label: "Vai trò", type: "select" as const, required: true,
    options: [
      { value: "ADMIN", label: "Quản trị viên" },
      { value: "CASHIER", label: "Thu ngân" },
      { value: "INVENTORY", label: "Kho" },
    ] },
];

const editUserFields = [
  { name: "fullName", label: "Họ tên", required: true },
  { name: "role", label: "Vai trò", type: "select" as const, required: true,
    options: [
      { value: "ADMIN", label: "Quản trị viên" },
      { value: "CASHIER", label: "Thu ngân" },
      { value: "INVENTORY", label: "Kho" },
    ] },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị viên", CASHIER: "Thu ngân", INVENTORY: "Kho",
};

export function AccountsClient({ users, permissions }: { users: AdminUser[]; permissions: Permission[] }) {
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; data?: AdminUser } | null>(null);
  const [tab, setTab] = useState<"users" | "permissions">("users");
  const [permState, setPermState] = useState<Permission[]>(permissions);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleCreate = async (data: Record<string, any>) => {
    await adminApiCall("/admin-users", "POST", data);
    router.refresh();
  };

  const handleEdit = async (data: Record<string, any>) => {
    await adminApiCall(`/admin-users/${dialog?.data?.id}`, "PUT", data);
    router.refresh();
  };

  const handleToggle = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    await adminApiCall(`/admin-users/${id}`, "PUT", { isActive: !user.isActive });
    router.refresh();
  };

  const togglePerm = (role: string, module: string, field: string) => {
    if (role === "ADMIN") return; // ADMIN always full access
    setPermState(prev => prev.map(p =>
      p.role === role && p.module === module ? { ...p, [field]: !(p as any)[field] } : p
    ));
  };

  const savePerm = async (role: string, module: string) => {
    const perm = permState.find(p => p.role === role && p.module === module);
    if (!perm) return;
    setSaving(true);
    try {
      await adminApiCall(`/admin-users/permissions/${role}`, "PUT", {
        module, canRead: perm.canRead, canCreate: perm.canCreate,
        canEdit: perm.canEdit, canDelete: perm.canDelete,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6" /> Quản lý Tài khoản
        </h1>
        {tab === "users" && (
          <button onClick={() => setDialog({ mode: "create" })}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" /> Tạo tài khoản
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button onClick={() => setTab("users")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "users" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          👥 Tài khoản
        </button>
        <button onClick={() => setTab("permissions")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "permissions" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          🔐 Phân quyền
        </button>
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold">Username</th>
                <th className="text-left px-4 py-3 font-semibold">Họ tên</th>
                <th className="text-center px-4 py-3 font-semibold">Vai trò</th>
                <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
                <th className="text-center px-4 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm">{u.username}</td>
                  <td className="px-4 py-3 font-medium">{u.fullName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                      u.role === "CASHIER" ? "bg-blue-100 text-blue-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>{ROLE_LABELS[u.role] || u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>{u.isActive ? "Hoạt động" : "Vô hiệu"}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => setDialog({ mode: "edit", data: u })}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors" title="Sửa">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggle(u.id)}
                        className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${u.isActive ? "text-gray-500 hover:text-red-600" : "text-gray-500 hover:text-emerald-600"}`}
                        title={u.isActive ? "Vô hiệu hóa" : "Kích hoạt"}>
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Chưa có tài khoản</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Permissions Tab */}
      {tab === "permissions" && (
        <div className="space-y-6">
          {["CASHIER", "INVENTORY"].map((role) => (
            <div key={role} className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-muted/50 border-b flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-sm">{ROLE_LABELS[role]}</span>
                <span className="text-xs text-muted-foreground ml-1">(Chỉnh sửa quyền truy cập)</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Module</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 w-20">Xem</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 w-20">Tạo</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 w-20">Sửa</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 w-20">Xóa</th>
                    <th className="text-center px-3 py-2 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((mod) => {
                    const perm = permState.find(p => p.role === role && p.module === mod);
                    return (
                      <tr key={mod} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{MODULE_LABELS[mod]}</td>
                        {["canRead", "canCreate", "canEdit", "canDelete"].map((field) => (
                          <td key={field} className="text-center px-3 py-2">
                            <input type="checkbox" checked={perm ? (perm as any)[field] : false}
                              onChange={() => togglePerm(role, mod, field)}
                              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                          </td>
                        ))}
                        <td className="text-center px-3 py-2">
                          <button onClick={() => savePerm(role, mod)} disabled={saving}
                            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium disabled:opacity-50">
                            Lưu
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
          <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-sm text-purple-700">
            💡 <strong>Quản trị viên (ADMIN)</strong> luôn có toàn quyền truy cập — không thể giới hạn.
          </div>
        </div>
      )}

      {dialog && (
        <CrudDialog
          title="tài khoản"
          fields={dialog.mode === "create" ? userFields : editUserFields}
          initialData={dialog.mode === "edit" ? dialog.data : { role: "CASHIER" }}
          onSubmit={dialog.mode === "create" ? handleCreate : handleEdit}
          onClose={() => setDialog(null)}
          mode={dialog.mode}
        />
      )}
    </div>
  );
}
