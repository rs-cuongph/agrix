"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrderHistoryList } from "@/components/pos/order-history-list";

export default function PosHistoryPage() {
  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header bar specific to history page */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 shrink-0">
        <Link
          href="/pos"
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Lịch sử giao dịch</h1>
          <p className="text-sm text-gray-500">Xem và in lại các hoá đơn đã bán</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <OrderHistoryList />
      </div>
    </div>
  );
}
