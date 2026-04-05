"use client";

import { useState } from "react";
import { useCart } from "@/lib/pos/cart-store";
import { searchCustomers, createCustomer, PosCustomer } from "@/lib/pos/pos-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserRound, Plus, Search, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export function CustomerPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useCart();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PosCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await searchCustomers(q);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer: PosCustomer) => {
    dispatch({ type: "SET_CUSTOMER", customerId: customer.id, customerName: customer.name, customerDebt: customer.outstandingDebt });
    toast.success(`Đã chọn: ${customer.name}`);
    onClose();
    reset();
  };

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error("Vui lòng nhập tên khách hàng"); return; }
    setCreating(true);
    try {
      const customer = await createCustomer(newName.trim(), newPhone.trim());
      handleSelect(customer);
    } catch {
      toast.error("Không thể tạo khách hàng. Thử lại.");
    } finally {
      setCreating(false);
    }
  };

  const reset = () => {
    setQuery(""); setResults([]); setShowCreateForm(false); setNewName(""); setNewPhone("");
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) { onClose(); reset(); } }}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden bg-white" showCloseButton={false}>
        <DialogHeader className="px-6 pt-6 pb-4 bg-emerald-950 text-white relative">
          <DialogTitle className="text-xl font-bold">Chọn khách hàng</DialogTitle>
          <button onClick={() => { onClose(); reset(); }} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>
        <div className="p-4">
          {!showCreateForm ? (
            <>
              {/* Search input */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 mb-4 focus-within:border-emerald-400 transition-colors">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc SĐT..."
                  className="flex-1 py-3 text-base outline-none bg-transparent"
                  autoFocus
                />
                {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />}
              </div>

              {/* Results */}
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {results.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 border-2 border-gray-100 hover:border-emerald-300 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <UserRound className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-base">{c.name}</p>
                      <p className={cn("text-sm", c.outstandingDebt > 0 ? "text-red-500" : "text-gray-400")}>
                        {c.phone || "Không có SĐT"}
                        {c.outstandingDebt > 0 && ` · Nợ: ${formatPrice(c.outstandingDebt)}`}
                      </p>
                    </div>
                  </button>
                ))}
                {query && results.length === 0 && !loading && (
                  <p className="text-center text-gray-400 py-4">Không tìm thấy khách hàng</p>
                )}
              </div>

              {/* Add new */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 transition-colors font-semibold text-base"
              >
                <Plus className="w-5 h-5" />
                Thêm khách mới
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4 text-base">Nhập thông tin khách hàng mới:</p>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tên khách hàng *"
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-emerald-400 outline-none mb-3"
                autoFocus
              />
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Số điện thoại (tùy chọn)"
                type="tel"
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-emerald-400 outline-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowCreateForm(false)} className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                  Quay lại
                </button>
                <button onClick={handleCreate} disabled={creating} className="flex-1 h-12 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50">
                  {creating ? "Đang tạo..." : "Tạo khách hàng"}
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
