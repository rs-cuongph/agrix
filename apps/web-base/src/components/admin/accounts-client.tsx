"use client";

import { useState, useRef, useCallback } from "react";
import { Shield, Plus, Pencil, Power, Key, Users as UsersIcon, Lightbulb, KeyRound, Trash2 } from "lucide-react";
import { CrudDialog, adminApiCall } from "@/components/admin/crud-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

type AdminUser = {
  id: string; username: string; fullName: string;
  role: string; isActive: boolean; createdAt: string;
  posPin?: string | null;
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
  {
    name: "role", label: "Vai trò", type: "select" as const, required: true,
    options: [
      { value: "ADMIN", label: "Quản trị viên" },
      { value: "CASHIER", label: "Thu ngân" },
      { value: "INVENTORY", label: "Kho" },
    ]
  },
];

const editUserFields = [
  { name: "fullName", label: "Họ tên", required: true },
  {
    name: "role", label: "Vai trò", type: "select" as const, required: true,
    options: [
      { value: "ADMIN", label: "Quản trị viên" },
      { value: "CASHIER", label: "Thu ngân" },
      { value: "INVENTORY", label: "Kho" },
    ]
  },
  { name: "password", label: "Mật khẩu mới", placeholder: "Để trống nếu không đổi" },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị viên", CASHIER: "Thu ngân", INVENTORY: "Kho",
};

// ── PIN Input Component (4 separate boxes) ────────────────────────────────────
function PinInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleInput = useCallback((idx: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const arr = value.padEnd(4, " ").split("");
    arr[idx] = digit || " ";
    const next = arr.join("").trimEnd();
    onChange(next);
    if (digit && idx < 3) refs[idx + 1].current?.focus();
  }, [value, onChange, refs]);

  const handleKey = useCallback((idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const arr = value.padEnd(4, " ").split("");
      if (arr[idx].trim()) {
        arr[idx] = " ";
        onChange(arr.join("").trimEnd());
      } else if (idx > 0) {
        refs[idx - 1].current?.focus();
        const prev = value.padEnd(4, " ").split("");
        prev[idx - 1] = " ";
        onChange(prev.join("").trimEnd());
      }
    }
  }, [value, onChange, refs]);

  return (
    <div className="flex gap-3 justify-center py-4">
      {[0, 1, 2, 3].map((idx) => {
        const filled = idx < value.length;
        return (
          <input
            key={idx}
            ref={refs[idx]}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={filled ? "\u2022" : ""}
            onFocus={(e) => e.target.select()}
            onChange={(e) => handleInput(idx, e.target.value)}
            onKeyDown={(e) => handleKey(idx, e)}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
              onChange(pasted);
              refs[Math.min(pasted.length, 3)].current?.focus();
            }}
            className={`w-14 h-16 text-center text-3xl rounded-xl border-2 font-bold outline-none transition-all duration-150 select-none caret-transparent ${filled
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100"
                : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300"
              } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:bg-white`}
            autoComplete="off"
          />
        );
      })}
    </div>
  );
}

export function AccountsClient({ users, permissions }: { users: AdminUser[]; permissions: Permission[] }) {
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; data?: AdminUser } | null>(null);
  const [permState, setPermState] = useState<Permission[]>(permissions);
  const [saving, setSaving] = useState(false);
  const [pinDialog, setPinDialog] = useState<{ userId: string; username: string; hasPin: boolean } | null>(null);
  const [pinValue, setPinValue] = useState("");
  const [pinSaving, setPinSaving] = useState(false);
  const router = useRouter();

  const handleCreate = async (data: Record<string, any>) => {
    await adminApiCall("/admin-users", "POST", data);
    toast.success("Tạo tài khoản thành công");
    router.refresh();
  };

  const handleEdit = async (data: Record<string, any>) => {
    await adminApiCall(`/admin-users/${dialog?.data?.id}`, "PUT", data);
    toast.success("Cập nhật tài khoản thành công");
    router.refresh();
  };

  const handleSetPin = async () => {
    if (!pinDialog) return;
    if (!/^\d{4}$/.test(pinValue)) {
      toast.error("Mã PIN phải là đúng 4 chữ số");
      return;
    }
    setPinSaving(true);
    try {
      await adminApiCall(`/admin-users/${pinDialog.userId}/pin`, "PUT", { pin: pinValue });
      toast.success("Cập nhật PIN thành công");
      setPinDialog(null);
      setPinValue("");
      router.refresh();
    } catch {
      toast.error("Lưu PIN thất bại");
    } finally {
      setPinSaving(false);
    }
  };

  const handleClearPin = async (userId: string) => {
    try {
      await adminApiCall(`/admin-users/${userId}/pin`, "DELETE");
      toast.success("Đã xóa PIN");
      router.refresh();
    } catch {
      toast.error("Xóa PIN thất bại");
    }
  };

  const handleToggle = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    await adminApiCall(`/admin-users/${id}`, "PUT", { isActive: !user.isActive });
    toast.success(user.isActive ? "Đã vô hiệu hóa tài khoản" : "Đã kích hoạt tài khoản");
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
      toast.success("Lưu phân quyền thành công");
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
        <button onClick={() => setDialog({ mode: "create" })}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" /> Tạo tài khoản
        </button>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-1.5">
            <UsersIcon className="w-4 h-4" /> Tài khoản
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-1.5">
            <Key className="w-4 h-4" /> Phân quyền
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold">Username</th>
                  <th className="text-left px-4 py-3 font-semibold">Họ tên</th>
                  <th className="text-center px-4 py-3 font-semibold">Vai trò</th>
                  <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="text-center px-4 py-3 font-semibold">POS PIN</th>
                  <th className="text-center px-4 py-3 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm">{u.username}</td>
                    <td className="px-4 py-3 font-medium">{u.fullName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                          u.role === "CASHIER" ? "bg-blue-100 text-blue-700" :
                            "bg-orange-100 text-orange-700"
                        }`}>{ROLE_LABELS[u.role] || u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>{u.isActive ? "Hoạt động" : "Vô hiệu"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(u.role === "ADMIN" || u.role === "CASHIER") ? (
                        <div className="flex items-center justify-center gap-1.5">
                          {u.posPin ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              <KeyRound className="w-3 h-3" /> Đã cấp
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Chưa cấp</span>
                          )}
                          <button
                            onClick={() => { setPinDialog({ userId: u.id, username: u.username, hasPin: !!u.posPin }); setPinValue(""); }}
                            className="p-1 rounded hover:bg-emerald-50 text-emerald-600" title="Cấp / Đổi PIN">
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          {u.posPin && (
                            <button
                              onClick={() => handleClearPin(u.id)}
                              className="p-1 rounded hover:bg-red-50 text-red-500" title="Xóa PIN">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
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
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chưa có tài khoản</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
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
                              <Checkbox checked={perm ? (perm as any)[field] : false}
                                onCheckedChange={() => togglePerm(role, mod, field)}
                                className="mx-auto" />
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
            <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-sm text-purple-700 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" /> <strong>Quản trị viên (ADMIN)</strong> luôn có toàn quyền truy cập — không thể giới hạn.
            </div>
          </div>
        </TabsContent>
      </Tabs>

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

      {/* PIN Set Dialog */}
      {pinDialog && (
        <Dialog open onOpenChange={() => { setPinDialog(null); setPinValue(""); }}>
          <DialogContent className="max-w-sm bg-white">
            <DialogHeader className="items-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-2">
                <KeyRound className="w-7 h-7 text-emerald-600" />
              </div>
              <DialogTitle className="text-lg">
                {pinDialog.hasPin ? "Đổi mã PIN" : "Cấp mã PIN"}
              </DialogTitle>
              <DialogDescription className="text-center">
                Tài khoản <strong className="text-gray-900">{pinDialog.username}</strong><br />
                Nhập mã PIN 4 chữ số để đăng nhập POS
              </DialogDescription>
            </DialogHeader>

            <PinInput value={pinValue} onChange={setPinValue} />

            {/* Dots progress */}
            <div className="flex justify-center gap-2 -mt-2 mb-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-200 ${i < pinValue.length ? "bg-emerald-500 scale-110" : "bg-gray-200"
                  }`} />
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => { setPinDialog(null); setPinValue(""); }}>
                Hủy
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={pinSaving || pinValue.length < 4}
                onClick={handleSetPin}
              >
                {pinSaving ? "Đang lưu..." : "Xác nhận"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
