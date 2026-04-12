"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportingExportResponse } from "./reporting-types";
import { formatDisplayDate, getGranularityLabel } from "./reporting-filters";

// ── Brand colors ──────────────────────────────────────────────────────────────
const BRAND   = [22, 163, 74]  as [number,number,number]; // emerald-600 #16a34a
const BRAND_L = [220, 252, 231] as [number,number,number]; // emerald-50
const GRAY_9  = [17, 24, 39]   as [number,number,number]; // gray-900
const GRAY_6  = [75, 85, 99]   as [number,number,number]; // gray-600
const GRAY_3  = [209, 213, 219] as [number,number,number]; // gray-300
const WHITE   = [255, 255, 255] as [number,number,number];
const STRIPE  = [248, 250, 252] as [number,number,number]; // slate-50

// ── Helpers ───────────────────────────────────────────────────────────────────
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

async function loadFont(doc: jsPDF) {
  try {
    const [regularRes, boldRes] = await Promise.all([
      fetch("/fonts/BeVietnamPro-Regular.ttf"),
      fetch("/fonts/BeVietnamPro-Bold.ttf"),
    ]);
    if (!regularRes.ok || !boldRes.ok) return false;

    const toBase64 = async (res: Response) => {
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    };

    const [regularB64, boldB64] = await Promise.all([toBase64(regularRes), toBase64(boldRes)]);

    doc.addFileToVFS("BeVietnamPro-Regular.ttf", regularB64);
    doc.addFont("BeVietnamPro-Regular.ttf", "BeVietnamPro", "normal");
    doc.addFileToVFS("BeVietnamPro-Bold.ttf", boldB64);
    doc.addFont("BeVietnamPro-Bold.ttf", "BeVietnamPro", "bold");
    return true;
  } catch {
    return false;
  }
}

// ── Drawing helpers ───────────────────────────────────────────────────────────
const PAGE_W = 841.89; // A4 landscape pt
const PAGE_H = 595.28;
const MARGIN = 36;
const CONTENT_W = PAGE_W - MARGIN * 2;

function drawHeader(doc: jsPDF, hasFont: boolean, title: string, subtitle: string) {
  // Header bar
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, PAGE_W, 56, "F");

  // Logo circle
  doc.setFillColor(...WHITE);
  doc.circle(MARGIN + 16, 28, 14, "F");
  doc.setTextColor(...BRAND);
  doc.setFont(hasFont ? "BeVietnamPro" : "helvetica", "bold");
  doc.setFontSize(11);
  doc.text("A", MARGIN + 12, 32);

  // Title
  doc.setTextColor(...WHITE);
  doc.setFontSize(16);
  doc.setFont(hasFont ? "BeVietnamPro" : "helvetica", "bold");
  doc.text(title, MARGIN + 38, 26);

  doc.setFontSize(9);
  doc.setFont(hasFont ? "BeVietnamPro" : "helvetica", "normal");
  doc.text(subtitle, MARGIN + 38, 38);

  // Right: generated date
  const now = new Date().toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  doc.setFontSize(8);
  doc.text(`Xuất lúc: ${now}`, PAGE_W - MARGIN, 24, { align: "right" });
}

function addPageFooter(doc: jsPDF, hasFont: boolean, pageNum: number, totalPages: number) {
  const y = PAGE_H - 16;
  doc.setDrawColor(...GRAY_3);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y - 4, PAGE_W - MARGIN, y - 4);

  doc.setFont(hasFont ? "BeVietnamPro" : "helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY_6);
  doc.text("Agrix — Hệ thống quản lý nông nghiệp", MARGIN, y + 2);
  doc.text(`Trang ${pageNum} / ${totalPages}`, PAGE_W - MARGIN, y + 2, { align: "right" });
}

function drawKpiBox(
  doc: jsPDF,
  hasFont: boolean,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
  sub?: string,
) {
  const h = 52;
  // Card bg + border
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...GRAY_3);
  doc.setLineWidth(0.6);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  // Accent top bar
  doc.setFillColor(...BRAND);
  doc.roundedRect(x, y, w, 3, 1, 1, "F");

  // Label
  doc.setFont(hasFont ? "BeVietnamPro" : "helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY_6);
  doc.text(label, x + 10, y + 16);

  // Value
  doc.setFont(hasFont ? "BeVietnamPro" : "helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...GRAY_9);
  doc.text(value, x + 10, y + 33);

  // Sub
  if (sub) {
    doc.setFont(hasFont ? "BeVietnamPro" : "helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_6);
    doc.text(sub, x + 10, y + 44);
  }
}

function sectionTitle(doc: jsPDF, hasFont: boolean, text: string, y: number) {
  doc.setFont(hasFont ? "BeVietnamPro" : "helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND);
  doc.text(text, MARGIN, y);

  doc.setDrawColor(...BRAND);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, y + 2, MARGIN + 40, y + 2);
  doc.setDrawColor(...GRAY_3);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 40, y + 2, MARGIN + CONTENT_W, y + 2);
}

// ── Main PDF export ───────────────────────────────────────────────────────────
export async function downloadPdfReport(payload: ReportingExportResponse) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const hasFont = await loadFont(doc);

  const filter = payload.report.filter;
  const summary = payload.report.summary;

  const periodLabel = `${formatDisplayDate(filter.from)} – ${formatDisplayDate(filter.to)}`;
  const granulLabel = getGranularityLabel(filter.granularity);

  // ── Page 1 ────────────────────────────────────────────────────────────────
  drawHeader(
    doc, hasFont,
    "Báo cáo kinh doanh",
    `Kỳ: ${periodLabel} · ${granulLabel}`,
  );

  // ── KPI boxes (4 across) ─────────────────────────────────────────────────
  const kpiY = 70;
  const kpiGap = 8;
  const kpiW = (CONTENT_W - kpiGap * 3) / 4;

  const kpis = [
    { label: "Tổng doanh thu", value: formatCurrency(summary.totalRevenue) },
    { label: "Tổng đơn hàng",  value: summary.totalOrders.toLocaleString("vi-VN"), sub: "đơn hoàn tất" },
    { label: "Sản phẩm",       value: summary.totalProducts.toLocaleString("vi-VN"), sub: "mặt hàng" },
    { label: "Khách hàng",     value: summary.totalCustomers.toLocaleString("vi-VN"), sub: "khách" },
  ];

  kpis.forEach((kpi, i) => {
    drawKpiBox(doc, hasFont, MARGIN + i * (kpiW + kpiGap), kpiY, kpiW, kpi.label, kpi.value, kpi.sub);
  });

  // ── Revenue series table ─────────────────────────────────────────────────
  let curY = kpiY + 62;
  sectionTitle(doc, hasFont, "Doanh thu theo kỳ", curY);
  curY += 10;

  const seriesData = payload.report.revenueSeries.map((p) => [
    p.bucketLabel,
    formatCurrency(p.revenue),
    p.orderCount.toLocaleString("vi-VN"),
    p.revenue > 0 && summary.totalRevenue > 0
      ? `${((p.revenue / summary.totalRevenue) * 100).toFixed(1)}%`
      : "0%",
  ]);

  autoTable(doc, {
    startY: curY,
    head: [["Kỳ", "Doanh thu", "Số đơn", "Tỷ lệ"]],
    body: seriesData,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_W,
    styles: {
      font: hasFont ? "BeVietnamPro" : "helvetica",
      fontSize: 8.5,
      cellPadding: { top: 5, bottom: 5, left: 8, right: 8 },
      textColor: GRAY_9,
    },
    headStyles: {
      fillColor: BRAND,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: { fillColor: STRIPE },
    columnStyles: {
      0: { cellWidth: 110 },
      1: { cellWidth: 120, halign: "right" },
      2: { cellWidth: 70,  halign: "right" },
      3: { cellWidth: 70,  halign: "right" },
    },
    didDrawPage: (data) => {
      drawHeader(doc, hasFont, "Báo cáo kinh doanh", `Kỳ: ${periodLabel} · ${granulLabel}`);
      addPageFooter(doc, hasFont, data.pageNumber, doc.getNumberOfPages());
    },
  });

  // ── Page 2 — Top products + Gross profit ─────────────────────────────────
  doc.addPage();
  drawHeader(doc, hasFont, "Báo cáo kinh doanh", `Kỳ: ${periodLabel} · ${granulLabel}`);

  curY = 70;
  sectionTitle(doc, hasFont, "Top sản phẩm bán chạy", curY);
  curY += 10;

  const productsData = payload.report.topProducts.slice(0, 15).map((p) => [
    `#${p.rank}`,
    p.productName,
    p.sku,
    p.categoryName ?? "—",
    p.quantitySold.toLocaleString("vi-VN"),
    formatCurrency(p.revenueContribution),
  ]);

  let afterProductsY = curY;
  autoTable(doc, {
    startY: curY,
    head: [["#", "Sản phẩm", "SKU", "Danh mục", "Số lượng", "Doanh thu"]],
    body: productsData,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_W,
    styles: {
      font: hasFont ? "BeVietnamPro" : "helvetica",
      fontSize: 8.5,
      cellPadding: { top: 5, bottom: 5, left: 8, right: 8 },
      textColor: GRAY_9,
    },
    headStyles: {
      fillColor: BRAND,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: { fillColor: STRIPE },
    columnStyles: {
      0: { cellWidth: 30, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 80 },
      3: { cellWidth: 110 },
      4: { cellWidth: 70, halign: "right" },
      5: { cellWidth: 110, halign: "right" },
    },
    didDrawPage: (data) => {
      if (data.pageNumber > 2) {
        drawHeader(doc, hasFont, "Báo cáo kinh doanh", `Kỳ: ${periodLabel} · ${granulLabel}`);
      }
      addPageFooter(doc, hasFont, data.pageNumber, doc.getNumberOfPages());
    },
    didParseCell: (data) => {
      if (data.row.index === 0 && data.section === "body") {
        afterProductsY = 0; // reset — tracked via didDrawPage
      }
    },
  });

  // ── Gross profit by category ─────────────────────────────────────────────
  // Get current Y after top products table
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 300;
  curY = finalY + 20;

  // Add new page if needed
  if (curY > PAGE_H - 120) {
    doc.addPage();
    drawHeader(doc, hasFont, "Báo cáo kinh doanh", `Kỳ: ${periodLabel} · ${granulLabel}`);
    curY = 70;
  }

  sectionTitle(doc, hasFont, "Lợi nhuận gộp theo danh mục", curY);
  curY += 10;

  const grossData = payload.report.grossProfitByCategory.map((c) => [
    c.categoryName,
    formatCurrency(c.revenue),
    formatCurrency(c.costOfGoodsSold),
    formatCurrency(c.grossProfit),
    c.hasIncompleteCostData ? "⚠ Thiếu giá vốn" : "✓",
  ]);

  autoTable(doc, {
    startY: curY,
    head: [["Danh mục", "Doanh thu", "Giá vốn", "Lợi nhuận gộp", "Trạng thái"]],
    body: grossData,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_W,
    styles: {
      font: hasFont ? "BeVietnamPro" : "helvetica",
      fontSize: 8.5,
      cellPadding: { top: 5, bottom: 5, left: 8, right: 8 },
      textColor: GRAY_9,
    },
    headStyles: {
      fillColor: BRAND,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: { fillColor: STRIPE },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 110, halign: "right" },
      2: { cellWidth: 110, halign: "right" },
      3: { cellWidth: 120, halign: "right", fontStyle: "bold" },
      4: { cellWidth: 100, halign: "center" },
    },
    didParseCell: (data) => {
      // Highlight incomplete cost data rows
      if (data.section === "body" && data.column.index === 4) {
        const raw = payload.report.grossProfitByCategory[data.row.index];
        if (raw?.hasIncompleteCostData) {
          data.cell.styles.textColor = [202, 138, 4] as [number,number,number]; // amber-600
        }
      }
    },
    didDrawPage: (data) => {
      if (data.pageNumber > 2) {
        drawHeader(doc, hasFont, "Báo cáo kinh doanh", `Kỳ: ${periodLabel} · ${granulLabel}`);
      }
      addPageFooter(doc, hasFont, data.pageNumber, doc.getNumberOfPages());
    },
  });

  // Stamp footer on page 1 retroactively (jsPDF draws page 1 first)
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    addPageFooter(doc, hasFont, i, total);
  }

  const fileName = payload.fileName.replace(/\.(xls|xlsx)$/, ".pdf");
  doc.save(fileName);
}

// ── Excel export (unchanged) ──────────────────────────────────────────────────
export async function downloadExcelReport(payload: ReportingExportResponse) {
  const filter = payload.report.filter;
  const summary = payload.report.summary;

  const html = `
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <h2>Báo cáo kinh doanh</h2>
        <p>Kỳ báo cáo: ${formatDisplayDate(filter.from)} → ${formatDisplayDate(filter.to)}</p>
        <p>Chu kỳ: ${getGranularityLabel(filter.granularity)}</p>
        <table border="1">
          <tr><th>Tổng doanh thu</th><th>Tổng đơn hàng</th><th>Sản phẩm</th><th>Khách hàng</th></tr>
          <tr>
            <td>${formatCurrency(summary.totalRevenue)}</td>
            <td>${summary.totalOrders}</td>
            <td>${summary.totalProducts}</td>
            <td>${summary.totalCustomers}</td>
          </tr>
        </table>
        <h3>Doanh thu theo kỳ</h3>
        <table border="1">
          <tr><th>Kỳ</th><th>Doanh thu</th><th>Số đơn</th></tr>
          ${payload.report.revenueSeries
            .map((p) => `<tr><td>${p.bucketLabel}</td><td>${formatCurrency(p.revenue)}</td><td>${p.orderCount}</td></tr>`)
            .join("")}
        </table>
        <h3>Top sản phẩm</h3>
        <table border="1">
          <tr><th>Hạng</th><th>Sản phẩm</th><th>SKU</th><th>Số lượng</th><th>Doanh thu</th></tr>
          ${payload.report.topProducts
            .map((p) => `<tr><td>${p.rank}</td><td>${p.productName}</td><td>${p.sku}</td><td>${p.quantitySold}</td><td>${formatCurrency(p.revenueContribution)}</td></tr>`)
            .join("")}
        </table>
        <h3>Lợi nhuận gộp theo danh mục</h3>
        <table border="1">
          <tr><th>Danh mục</th><th>Doanh thu</th><th>Giá vốn</th><th>Lợi nhuận gộp</th></tr>
          ${payload.report.grossProfitByCategory
            .map((c) => `<tr><td>${c.categoryName}</td><td>${formatCurrency(c.revenue)}</td><td>${formatCurrency(c.costOfGoodsSold)}</td><td>${formatCurrency(c.grossProfit)}</td></tr>`)
            .join("")}
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = payload.fileName;
  link.click();
  URL.revokeObjectURL(url);
}
