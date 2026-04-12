"use client";

import jsPDF from "jspdf";
import { ReportingExportResponse } from "./reporting-types";

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadPdfReport(payload: ReportingExportResponse) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  let y = 40;

  const writeLine = (label: string, value: string, gap = 18) => {
    doc.text(`${label}: ${value}`, 40, y);
    y += gap;
  };

  doc.setFontSize(18);
  doc.text("Bao cao kinh doanh", 40, y);
  y += 24;
  doc.setFontSize(11);

  writeLine("Ky bao cao", `${payload.report.filter.from} -> ${payload.report.filter.to}`);
  writeLine("Granularity", payload.report.filter.granularity);
  writeLine("Tong doanh thu", formatCurrency(payload.report.summary.totalRevenue));
  writeLine("Tong don hang", String(payload.report.summary.totalOrders));
  writeLine("Tong san pham kich hoat", String(payload.report.summary.totalProducts));
  writeLine("Tong khach hang", String(payload.report.summary.totalCustomers));

  y += 10;
  doc.text("Doanh thu theo ky", 40, y);
  y += 18;
  payload.report.revenueSeries.slice(0, 12).forEach((item) => {
    writeLine(item.bucketLabel, `${formatCurrency(item.revenue)} | ${item.orderCount} don`, 16);
  });

  y += 10;
  doc.text("Top san pham", 40, y);
  y += 18;
  payload.report.topProducts.slice(0, 10).forEach((item) => {
    writeLine(`#${item.rank} ${item.productName}`, `${item.quantitySold} | ${formatCurrency(item.revenueContribution)}`, 16);
  });

  if (y > 500) {
    doc.addPage();
    y = 40;
  }

  y += 10;
  doc.text("Loi nhuan gop theo danh muc", 40, y);
  y += 18;
  payload.report.grossProfitByCategory.slice(0, 10).forEach((item) => {
    writeLine(
      item.categoryName,
      `${formatCurrency(item.grossProfit)}${item.hasIncompleteCostData ? " | thieu gia von" : ""}`,
      16,
    );
  });

  doc.save(payload.fileName.replace(/\.xls$/, ".pdf"));
}

export async function downloadExcelReport(payload: ReportingExportResponse) {
  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <h2>Bao cao kinh doanh</h2>
        <p>Ky bao cao: ${payload.report.filter.from} -> ${payload.report.filter.to}</p>
        <p>Granularity: ${payload.report.filter.granularity}</p>
        <table border="1">
          <tr><th>Tong doanh thu</th><th>Tong don hang</th><th>Tong san pham</th><th>Tong khach hang</th></tr>
          <tr>
            <td>${payload.report.summary.totalRevenue}</td>
            <td>${payload.report.summary.totalOrders}</td>
            <td>${payload.report.summary.totalProducts}</td>
            <td>${payload.report.summary.totalCustomers}</td>
          </tr>
        </table>
        <h3>Doanh thu theo ky</h3>
        <table border="1">
          <tr><th>Ky</th><th>Doanh thu</th><th>So don</th></tr>
          ${payload.report.revenueSeries
            .map(
              (item) =>
                `<tr><td>${item.bucketLabel}</td><td>${item.revenue}</td><td>${item.orderCount}</td></tr>`,
            )
            .join("")}
        </table>
        <h3>Top san pham</h3>
        <table border="1">
          <tr><th>Hang</th><th>San pham</th><th>SKU</th><th>So luong</th><th>Doanh thu</th></tr>
          ${payload.report.topProducts
            .map(
              (item) =>
                `<tr><td>${item.rank}</td><td>${item.productName}</td><td>${item.sku}</td><td>${item.quantitySold}</td><td>${item.revenueContribution}</td></tr>`,
            )
            .join("")}
        </table>
      </body>
    </html>
  `;

  downloadBlob(
    new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" }),
    payload.fileName,
  );
}
