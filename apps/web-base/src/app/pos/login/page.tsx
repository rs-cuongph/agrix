"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, Delete } from "lucide-react";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 4; // Chuẩn 4 số như ATM — nhất quán với seed data
const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function PosLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Auto-submit khi đủ PIN_LENGTH số
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      handleSubmit(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleSubmit = async (currentPin: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/pos/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: currentPin }),
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
      {/* Branding */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Package className="w-9 h-9 text-white" />
        </div>
        <div>
          <p className="text-white text-3xl font-bold tracking-tight">Agrix POS</p>
          <p className="text-white/50 text-base">Nhập mã PIN để đăng nhập</p>
        </div>
      </div>

      {/* PIN Display — 4 chấm cố định như ATM */}
      <div className="flex gap-5 mb-10">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-200",
              i < pin.length
                ? "bg-emerald-400 scale-125"
                : "bg-white/20"
            )}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {DIGITS.map((d, i) => (
          <button
            key={i}
            onClick={() => {
              if (d === "⌫") handleDigit("⌫");
              else if (d) handleDigit(d);
            }}
            disabled={loading || (!d && d !== "0")}
            className={cn(
              "h-20 rounded-2xl text-white text-2xl font-semibold transition-all duration-150 active:scale-95 select-none",
              d === "⌫"
                ? "bg-white/10 hover:bg-white/20"
                : d
                ? "bg-white/10 hover:bg-white/20"
                : "invisible"
            )}
          >
            {d === "⌫" ? <Delete className="w-6 h-6 mx-auto" /> : d}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <p className="mt-8 text-white/50 text-base animate-pulse">Đang kiểm tra...</p>
      )}
    </div>
  );
}
