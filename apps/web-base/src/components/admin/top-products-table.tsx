"use client";

import { TopProductRecord } from "@/lib/admin/reporting-types";

type Props = {
  items: TopProductRecord[];
};

export function TopProductsTable({ items }: Props) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Top san pham ban chay</h2>
        <p className="text-sm text-muted-foreground">
          Xep hang theo so luong ban ra trong ky da chon
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Chua co du lieu san pham ban ra trong ky nay
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">Hang</th>
                <th className="py-2">San pham</th>
                <th className="py-2">Danh muc</th>
                <th className="py-2 text-right">So luong</th>
                <th className="py-2 text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.productId} className="border-b last:border-0">
                  <td className="py-3 font-semibold text-foreground">#{item.rank}</td>
                  <td className="py-3">
                    <div className="font-medium text-foreground">{item.productName}</div>
                    <div className="text-xs text-muted-foreground">{item.sku}</div>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {item.categoryName || "Chua phan loai"}
                  </td>
                  <td className="py-3 text-right font-medium">
                    {item.quantitySold.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3 text-right font-medium text-emerald-600">
                    {item.revenueContribution.toLocaleString("vi-VN")}đ
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
