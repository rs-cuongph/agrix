"use client";

import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryGrossProfitRecord } from "@/lib/admin/reporting-types";

type Props = {
  items: CategoryGrossProfitRecord[];
};

export function GrossProfitCategoryTable({ items }: Props) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Loi nhuan gop theo danh muc</h2>
        <p className="text-sm text-muted-foreground">
          Tinh theo doanh thu tru gia von tren ky bao cao da chon
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Chua co du lieu danh muc trong ky nay
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">Danh muc</th>
                <th className="py-2 text-right">Doanh thu</th>
                <th className="py-2 text-right">Gia von</th>
                <th className="py-2 text-right">Loi nhuan gop</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.categoryId || item.categoryName} className="border-b last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{item.categoryName}</span>
                      {item.hasIncompleteCostData ? (
                        <Badge variant="outline" className="gap-1">
                          <AlertCircle className="size-3" />
                          Thieu gia von
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3 text-right">{item.revenue.toLocaleString("vi-VN")}đ</td>
                  <td className="py-3 text-right">
                    {item.costOfGoodsSold.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="py-3 text-right font-semibold text-emerald-600">
                    {item.grossProfit.toLocaleString("vi-VN")}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
