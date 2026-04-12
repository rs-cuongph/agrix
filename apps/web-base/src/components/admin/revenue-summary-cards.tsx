"use client";

import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";

type Props = {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
};

export function RevenueSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={DollarSign}
        label="Tong doanh thu"
        value={`${summary.totalRevenue.toLocaleString("vi-VN")}đ`}
        color="text-emerald-600"
      />
      <StatCard
        icon={ShoppingCart}
        label="Tong don hang"
        value={summary.totalOrders}
        color="text-sky-600"
      />
      <StatCard
        icon={Package}
        label="San pham dang kinh doanh"
        value={summary.totalProducts}
        color="text-amber-600"
      />
      <StatCard
        icon={Users}
        label="Tong khach hang"
        value={summary.totalCustomers}
        color="text-rose-600"
      />
    </div>
  );
}
