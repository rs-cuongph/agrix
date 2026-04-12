"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFilterLabel } from "@/lib/admin/reporting-filters";
import { createReportExport } from "@/lib/admin/reporting-api";
import { downloadExcelReport, downloadPdfReport } from "@/lib/admin/reporting-export";
import { ReportingFilter } from "@/lib/admin/reporting-types";

type Props = {
  filter: ReportingFilter;
};

export function ReportingExportActions({ filter }: Props) {
  const [lastExportAt, setLastExportAt] = useState<string | null>(null);

  const exportReport = async (format: "pdf" | "xlsx") => {
    const toastId = `report-export-${format}`;
    try {
      toast.loading(
        format === "pdf" ? "Đang tạo báo cáo PDF..." : "Đang tạo báo cáo Excel...",
        { id: toastId },
      );
      const payload = await createReportExport(format, filter);
      if (format === "pdf") {
        await downloadPdfReport(payload);
      } else {
        await downloadExcelReport(payload);
      }
      setLastExportAt(payload.generatedAt);
      toast.success("Xuất báo cáo thành công", { id: toastId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xuất báo cáo";
      toast.error(message, { id: toastId });
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Xuất báo cáo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Kỳ hiện tại: {getFilterLabel(filter)}
        </p>
        {lastExportAt ? (
          <p className="text-xs text-muted-foreground">
            Lần xuất gần nhất: {new Date(lastExportAt).toLocaleString("vi-VN")}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => exportReport("pdf")}>
          <FileText data-icon="inline-start" />
          Xuất PDF
        </Button>
        <Button variant="outline" onClick={() => exportReport("xlsx")}>
          <FileSpreadsheet data-icon="inline-start" />
          Xuất Excel
        </Button>
      </CardContent>
    </Card>
  );
}
