"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, Delete, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 4; // Hoặc 6, tùy cấu hình
const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

interface PosUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export default function PosLoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<PosUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PosUser | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  useEffect(() => {
    fetch("/api/pos/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        setFetchingUsers(false);
      })
      .catch(() => {
        toast.error("Không thể tải danh sách thu ngân");
        setFetchingUsers(false);
      });
  }, []);

  const handleDigit = (d: string) => {
    if (loading) return;
    if (d === "⌫") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (!d) return;
    if (pin.length >= PIN_LENGTH) return;
    setPin((p) => p + d);
  };

  useEffect(() => {
    if (pin.length === PIN_LENGTH && selectedUser) {
      handleSubmit(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleSubmit = async (currentPin: string) => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pos/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: selectedUser.username, pin: currentPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Mã PIN không đúng");
        setPin("");
      } else {
        toast.success(`Xin chào, ${data.user?.fullName || data.user?.username}!`);
        router.push("/pos");
        router.refresh();
      }
    } catch {
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center px-6">
      <div className="flex items-center gap-3 mb-10 mt-10">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Package className="w-9 h-9 text-white" />
        </div>
        <div>
          <p className="text-white text-3xl font-bold tracking-tight">Agrix POS</p>
          <p className="text-white/50 text-base">
            {!selectedUser ? "Chọn tài khoản thu ngân" : "Nhập mã PIN để đăng nhập"}
          </p>
        </div>
      </div>

      {!selectedUser ? (
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
          {fetchingUsers ? (
            <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div></div>
          ) : users.length === 0 ? (
            <p className="text-white/70 text-center py-10">Không tìm thấy tài khoản thu ngân nào.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className="bg-white/10 hover:bg-emerald-500/30 transition-all rounded-2xl p-6 flex flex-col items-center gap-3 border border-white/5 hover:border-emerald-500/50 group"
                >
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold uppercase tracking-wider group-hover:scale-110 transition-transform">
                    {u.fullName?.charAt(0) || u.username.charAt(0)}
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium truncate w-32">{u.fullName}</p>
                    <p className="text-white/50 text-xs truncate w-32">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-250 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300 outline-none">
          <button
            onClick={() => { setSelectedUser(null); setPin(""); }}
            className="mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors outline-none focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" /> Chọn tài khoản khác
          </button>

          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold uppercase tracking-wider mb-4 border-4 border-emerald-500/30 shadow-xl">
              {selectedUser.fullName?.charAt(0) || selectedUser.username.charAt(0)}
            </div>
            <p className="text-white text-xl font-medium">{selectedUser.fullName}</p>
          </div>

          <div className="flex gap-5 mb-10">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-6 h-6 rounded-full transition-all duration-200",
                  i < pin.length ? "bg-emerald-400 scale-125" : "bg-white/20"
                )}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5 w-full max-w-[380px] mb-10">
            {DIGITS.map((d, i) => (
              <button
                key={i}
                onClick={() => {
                  if (d === "⌫") handleDigit("⌫");
                  else if (d) handleDigit(d);
                }}
                disabled={loading || (!d && d !== "0")}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-xl text-white text-3xl font-semibold transition-all duration-150 active:scale-95 select-none bg-white/10 hover:bg-white/20 border border-white/5 outline-none focus:outline-none appearance-none cursor-pointer",
                  d === "⌫" ? "" : d ? "shadow-sm" : "invisible"
                )}
              >
                {d === "⌫" ? <Delete className="w-8 h-8 mx-auto" /> : d}
              </button>
            ))}
          </div>

          {loading && <p className="text-white/50 text-base animate-pulse">Đang kiểm tra...</p>}
        </div>
      )}
    </div>
  );
}
