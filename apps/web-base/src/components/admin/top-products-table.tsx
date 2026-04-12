"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopProductRecord } from "@/lib/admin/reporting-types";

type Props = {
  items: TopProductRecord[];
};

export function TopProductsTable({ items }: Props) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Top sản phẩm bán chạy</CardTitle>
        <CardDescription>
          Xếp hạng theo số lượng bán ra trong kỳ đã chọn.
        </CardDescription>
      </CardHeader>
      <CardContent>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu sản phẩm bán ra trong kỳ này.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Hạng</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Doanh thu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-semibold text-foreground">#{item.rank}</TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{item.productName}</div>
                    <div className="text-xs text-muted-foreground">{item.sku}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.categoryName || "Chưa phân loại"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.quantitySold.toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">
                    {item.revenueContribution.toLocaleString("vi-VN")}đ
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
      </CardContent>
    </Card>
  );
}
