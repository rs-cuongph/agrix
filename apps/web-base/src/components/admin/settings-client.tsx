"use client";

import { useState, useEffect } from "react";
import { Settings, FolderTree, Ruler, Shield, QrCode } from "lucide-react";
import { CategoriesClient } from "@/components/admin/categories-client";
import { UnitsClient } from "@/components/admin/units-client";
import { AccountsClient } from "@/components/admin/accounts-client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApiCall } from "@/components/admin/crud-dialog";
import { toast } from "sonner";

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
type Permission = {
  id: string; role: string; module: string;
  canRead: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean;
};
type StoreSettings = {
  bankBin?: string | null;
  bankAccountNo?: string | null;
  bankAccountName?: string | null;
};

const ALL_TABS = [
  { id: "categories", label: "Danh mục", icon: FolderTree, adminOnly: false },
  { id: "units", label: "Đơn vị", icon: Ruler, adminOnly: false },
  { id: "accounts", label: "Tài khoản", icon: Shield, adminOnly: true },
  { id: "payment", label: "Thanh toán", icon: QrCode, adminOnly: true },
] as const;

let banksCache: { bin: string; shortName: string; name: string; logo: string }[] | null = null;
let banksPromise: Promise<any[]> | null = null;

function fetchBanksUnique() {
  if (banksCache) return Promise.resolve(banksCache);
  if (!banksPromise) {
    banksPromise = fetch("https://api.vietqr.io/v2/banks")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.code === "00" && Array.isArray(data.data)) {
          banksCache = data.data;
          return data.data;
        }
        return [];
      })
      .catch((err) => {
        console.error("Failed to fetch banks", err);
        return [];
      });
  }
  return banksPromise;
}

function BankConfigSection({ initialSettings }: { initialSettings: StoreSettings }) {
  const [bankBin, setBankBin] = useState(initialSettings.bankBin ?? "");
  const [bankAccountNo, setBankAccountNo] = useState(initialSettings.bankAccountNo ?? "");
  const [bankAccountName, setBankAccountName] = useState(initialSettings.bankAccountName ?? "");
  const [saving, setSaving] = useState(false);
  const [banks, setBanks] = useState<{ bin: string; shortName: string; name: string; logo: string }[]>(banksCache || []);
  const [openBankList, setOpenBankList] = useState(false);

  useEffect(() => {
    fetchBanksUnique().then(data => {
      if (data && data.length > 0) setBanks(data);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApiCall("/admin/settings", "PATCH", { bankBin, bankAccountNo, bankAccountName });
      toast.success("Lưu cấu hình thanh toán thành công");
    } catch {
      toast.error("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6 max-w-lg">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Cấu hình VietQR / Chuyển khoản</h3>
        <p className="text-sm text-muted-foreground">
          Thông tin ngân hàng nhận thanh toán, hiển thị trên mã QR ở màn hình POS.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Ngân hàng</label>
          <Popover open={openBankList} onOpenChange={setOpenBankList}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={openBankList}
                className="w-full h-10 justify-between font-normal bg-white"
              >
                {bankBin && banks.length > 0 ? (
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banks.find(b => b.bin === bankBin)?.logo} alt="logo" className="w-5 h-5 object-contain" />
                    <span className="font-semibold text-gray-900">{banks.find(b => b.bin === bankBin)?.shortName}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline-block truncate max-w-[200px]">({banks.find(b => b.bin === bankBin)?.name})</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Chọn ngân hàng...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] sm:w-[480px] p-0 bg-white border shadow-md z-50" align="start">
              <Command>
                <CommandInput placeholder="Tìm tên, mã BIN..." />
                <CommandList>
                  <CommandEmpty>Không tìm thấy ngân hàng.</CommandEmpty>
                  <CommandGroup>
                    {banks.map((bank) => (
                      <CommandItem
                        key={bank.bin}
                        value={`${bank.shortName} ${bank.name} ${bank.bin}`}
                        onSelect={() => {
                          setBankBin(bank.bin);
                          setOpenBankList(false);
                        }}
                        className="py-2.5 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={bank.logo} alt={bank.shortName} className="w-10 h-10 object-contain bg-white rounded flex-shrink-0" />
                          <span className="font-semibold text-sm text-gray-900">{bank.shortName}</span>
                          <span className="text-xs text-muted-foreground hidden sm:block truncate sm:max-w-[260px]">
                            {bank.name}
                          </span>
                        </div>
                        {bankBin === bank.bin && (
                          <Check className="h-5 w-5 text-emerald-600 shrink-0 ml-auto" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Số tài khoản</label>
          <Input
            placeholder="VD: 123456789"
            value={bankAccountNo}
            onChange={(e) => setBankAccountNo(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tên chủ tài khoản</label>
          <Input
            placeholder="VD: NGUYEN VAN A"
            value={bankAccountName}
            onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
          />
          <p className="text-xs text-muted-foreground">Viết HOA không dấu, đúng khớp với tên tài khoản ngân hàng</p>
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 w-full">
        {saving ? "Đang lưu..." : "Lưu cấu hình"}
      </Button>
    </div>
  );
}

export function SettingsClient({
  categories,
  baseUnits,
  conversions,
  products,
  users,
  permissions,
  userRole,
  storeSettings,
}: {
  categories: Category[];
  baseUnits: BaseUnit[];
  conversions: UnitConversion[];
  products: Product[];
  users: AdminUser[];
  permissions: Permission[];
  userRole: string;
  storeSettings?: StoreSettings;
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
        {isAdmin && (
          <TabsContent value="payment">
            <BankConfigSection initialSettings={storeSettings ?? {}} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
