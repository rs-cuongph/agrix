"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Không có dữ liệu phù hợp cho danh sách này.
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
                  {item.phone || "Không có số điện thoại"}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-foreground">
                {renderValue(item)}
              </p>
            </div>
          ))}
        </div>
      )}
      </CardContent>
    </Card>
  );
}

export function TopCustomersPanel({ topByPurchase, topByDebt }: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <CustomerList
        title="Top khách hàng mua nhiều"
        description="Xếp hạng theo tổng giá trị mua trong kỳ."
        items={topByPurchase}
        renderValue={(item) =>
          `${(item as CustomerPurchaseRecord).totalPurchaseAmount.toLocaleString("vi-VN")}đ`
        }
      />
      <CustomerList
        title="Top khách hàng nợ nhiều"
        description="Xếp hạng theo dư nợ hiện hành."
        items={topByDebt}
        renderValue={(item) =>
          `${(item as CustomerDebtRecord).outstandingDebt.toLocaleString("vi-VN")}đ`
        }
      />
    </div>
  );
}
