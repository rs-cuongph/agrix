"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getStoreSettings, StoreSettings } from "@/lib/pos/pos-api";
import { Loader2 } from "lucide-react";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function buildVietQR(settings: StoreSettings, amount: number): string {
  if (!settings.bankBin || !settings.bankAccountNo) return "";
  // VietQR EMVCo format (simplified static QR with amount)
  const memo = encodeURIComponent(`Thanh toan ${amount}`);
  return `https://img.vietqr.io/image/${settings.bankBin}-${settings.bankAccountNo}-compact2.png?amount=${amount}&addInfo=${memo}&accountName=${encodeURIComponent(settings.bankAccountName || "")}`;
}

export function PaymentQR({ total }: { total: number }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreSettings()
      .then(setSettings)
      .catch(() => setSettings(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-12 gap-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-gray-400">Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  if (!settings?.bankBin || !settings?.bankAccountNo) {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-center">
        <p className="text-gray-500 text-base">Chưa cấu hình thông tin ngân hàng.</p>
        <p className="text-gray-400 text-sm">Vui lòng cài đặt trong trang Admin → Cài đặt.</p>
      </div>
    );
  }

  const qrUrl = buildVietQR(settings, total);

  return (
    <div className="flex flex-col items-center py-4 gap-4">
      <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-gray-100">
        {/* Use VietQR image URL for rich QR that includes bank branding */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="VietQR" className="w-56 h-56 object-contain" />
      </div>
      <div className="text-center">
        <p className="text-gray-500 text-base">{settings.bankAccountName}</p>
        <p className="text-gray-600 font-semibold text-lg">{settings.bankAccountNo}</p>
        <p className="text-emerald-600 font-bold text-3xl mt-2">{formatPrice(total)}</p>
      </div>
      <p className="text-gray-400 text-sm text-center">Mở ứng dụng ngân hàng và quét mã QR để thanh toán</p>
    </div>
  );
}
