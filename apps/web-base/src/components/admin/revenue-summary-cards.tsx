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
        label="Tổng doanh thu"
        value={`${summary.totalRevenue.toLocaleString("vi-VN")}đ`}
        color="text-emerald-600"
        description="Doanh thu thuần từ các đơn đã hoàn tất trong kỳ."
      />
      <StatCard
        icon={ShoppingCart}
        label="Tổng đơn hàng"
        value={summary.totalOrders}
        color="text-sky-600"
        description="Số đơn hàng được tính vào báo cáo kinh doanh."
      />
      <StatCard
        icon={Package}
        label="Sản phẩm đang kinh doanh"
        value={summary.totalProducts}
        color="text-amber-600"
        description="Tổng mặt hàng đang hoạt động trong hệ thống."
      />
      <StatCard
        icon={Users}
        label="Tổng khách hàng"
        value={summary.totalCustomers}
        color="text-rose-600"
        description="Tệp khách hàng phục vụ theo dõi mua hàng và công nợ."
      />
    </div>
  );
}
