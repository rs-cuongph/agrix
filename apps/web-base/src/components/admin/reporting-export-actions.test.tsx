import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportingExportActions } from "./reporting-export-actions";

jest.mock("sonner", () => ({
  toast: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/admin/reporting-api", () => ({
  createReportExport: jest.fn(),
}));

jest.mock("@/lib/admin/reporting-export", () => ({
  downloadPdfReport: jest.fn(),
  downloadExcelReport: jest.fn(),
}));

import { toast } from "sonner";
import { createReportExport } from "@/lib/admin/reporting-api";
import {
  downloadExcelReport,
  downloadPdfReport,
} from "@/lib/admin/reporting-export";

describe("ReportingExportActions", () => {
  it("exports pdf and shows the last export timestamp", async () => {
    const user = userEvent.setup();
    (createReportExport as jest.Mock).mockResolvedValue({
      format: "pdf",
      fileName: "bao-cao.pdf",
      mimeType: "application/pdf",
      generatedAt: "2026-04-12T10:30:00.000Z",
      report: {
        filter: { granularity: "day", from: "2026-04-01", to: "2026-04-01" },
        summary: {
          totalRevenue: 100000,
          totalOrders: 2,
          totalProducts: 12,
          totalCustomers: 7,
        },
        revenueSeries: [],
        topProducts: [],
        grossProfitByCategory: [],
        topCustomersByPurchase: [],
        topCustomersByDebt: [],
      },
    });

    render(
      <ReportingExportActions
        filter={{
          granularity: "day",
          from: "2026-04-01",
          to: "2026-04-01",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /pdf/i }));

    await waitFor(() => {
      expect(createReportExport).toHaveBeenCalledWith("pdf", {
        granularity: "day",
        from: "2026-04-01",
        to: "2026-04-01",
      });
    });

    expect(downloadPdfReport).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
    expect(screen.getByText(/lan xuat gan nhat/i)).toBeInTheDocument();
  });

  it("exports excel", async () => {
    const user = userEvent.setup();
    (createReportExport as jest.Mock).mockResolvedValue({
      format: "xlsx",
      fileName: "bao-cao.xls",
      mimeType: "application/vnd.ms-excel",
      generatedAt: "2026-04-12T10:30:00.000Z",
      report: {
        filter: { granularity: "day", from: "2026-04-01", to: "2026-04-01" },
        summary: {
          totalRevenue: 100000,
          totalOrders: 2,
          totalProducts: 12,
          totalCustomers: 7,
        },
        revenueSeries: [],
        topProducts: [],
        grossProfitByCategory: [],
        topCustomersByPurchase: [],
        topCustomersByDebt: [],
      },
    });

    render(
      <ReportingExportActions
        filter={{
          granularity: "day",
          from: "2026-04-01",
          to: "2026-04-01",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /excel/i }));

    await waitFor(() => {
      expect(downloadExcelReport).toHaveBeenCalled();
    });
  });
});
