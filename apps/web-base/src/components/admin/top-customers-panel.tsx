"use client";

import { CustomerDebtRecord, CustomerPurchaseRecord } from "@/lib/admin/reporting-types";

type Props = {
  topByPurchase: CustomerPurchaseRecord[];
  topByDebt: CustomerDebtRecord[];
};

function CustomerList({
  title,
  description,
  items,
  renderValue,
}: {
  title: string;
  description: string;
  items: Array<CustomerPurchaseRecord | CustomerDebtRecord>;
  renderValue: (item: CustomerPurchaseRecord | CustomerDebtRecord) => string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Khong co du lieu phu hop cho danh sach nay
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.customerId}
              className="flex items-start justify-between gap-4 rounded-lg border px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  #{item.rank} {item.customerName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.phone || "Khong co so dien thoai"}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-foreground">
                {renderValue(item)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TopCustomersPanel({ topByPurchase, topByDebt }: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <CustomerList
        title="Top khach hang mua nhieu"
        description="Xep hang theo tong gia tri mua trong ky"
        items={topByPurchase}
        renderValue={(item) =>
          `${(item as CustomerPurchaseRecord).totalPurchaseAmount.toLocaleString("vi-VN")}đ`
        }
      />
      <CustomerList
        title="Top khach hang no nhieu"
        description="Xep hang theo du no hien hanh"
        items={topByDebt}
        renderValue={(item) =>
          `${(item as CustomerDebtRecord).outstandingDebt.toLocaleString("vi-VN")}đ`
        }
      />
    </div>
  );
}
