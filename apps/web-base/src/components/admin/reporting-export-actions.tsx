"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
        format === "pdf" ? "Dang tao bao cao PDF..." : "Dang tao bao cao Excel...",
        { id: toastId },
      );
      const payload = await createReportExport(format, filter);
      if (format === "pdf") {
        await downloadPdfReport(payload);
      } else {
        await downloadExcelReport(payload);
      }
      setLastExportAt(payload.generatedAt);
      toast.success("Xuat bao cao thanh cong", { id: toastId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the xuat bao cao";
      toast.error(message, { id: toastId });
    }
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Xuat bao cao</h2>
          <p className="text-sm text-muted-foreground">
            Ky hien tai: {getFilterLabel(filter)}
          </p>
          {lastExportAt ? (
            <p className="text-xs text-muted-foreground">
              Lan xuat gan nhat: {new Date(lastExportAt).toLocaleString("vi-VN")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => exportReport("pdf")}>
            <FileText className="size-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport("xlsx")}>
            <FileSpreadsheet className="size-4" />
            Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
