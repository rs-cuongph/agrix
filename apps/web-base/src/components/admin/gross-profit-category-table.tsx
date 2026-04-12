"use client";

import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { CategoryGrossProfitRecord } from "@/lib/admin/reporting-types";

type Props = {
  items: CategoryGrossProfitRecord[];
};

export function GrossProfitCategoryTable({ items }: Props) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Lợi nhuận gộp theo danh mục</CardTitle>
        <CardDescription>
          Tính theo doanh thu trừ giá vốn trên kỳ báo cáo đã chọn.
        </CardDescription>
      </CardHeader>
      <CardContent>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu danh mục trong kỳ này.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Doanh thu</TableHead>
              <TableHead className="text-right">Giá vốn</TableHead>
              <TableHead className="text-right">Lợi nhuận gộp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {items.map((item) => (
                <TableRow key={item.categoryId || item.categoryName}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{item.categoryName}</span>
                      {item.hasIncompleteCostData ? (
                        <Badge variant="outline" className="gap-1">
                          <AlertCircle />
                          Thiếu giá vốn
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.revenue.toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell className="text-right">
                    {item.costOfGoodsSold.toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600">
                    {item.grossProfit.toLocaleString("vi-VN")}đ
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
