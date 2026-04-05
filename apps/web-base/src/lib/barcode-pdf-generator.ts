import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";

export interface ProductLabelData {
  id: string;
  name: string;
  price: number;
  barcode: string;
}

const removeVietnameseTones = (str: string) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

export const generateProductBarcodesPdf = async (products: ProductLabelData[]) => {
  // Label Config: 50mm x 30mm standard thermal label
  const pageWidth = 50;
  const pageHeight = 30;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [pageWidth, pageHeight],
  });

  const canvas = document.createElement("canvas");

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    
    // Add a new page for each product after the primary first page
    if (i > 0) {
      doc.addPage([pageWidth, pageHeight], "landscape");
    }

    // Prepare Barcode Value
    let codeValue = p.barcode && p.barcode.trim() ? p.barcode.trim() : p.id;
    // Strip purely unsafe non-ascii for CODE128 encoding
    codeValue = codeValue.replace(/[^\x00-\x7F]/g, "").substring(0, 30); 
    if (!codeValue) codeValue = p.id.substring(0, 8); // Ultimate fallback

    const isEAN = /^\d{12,13}$/.test(codeValue);
    
    try {
      JsBarcode(canvas, codeValue, {
        format: isEAN ? "EAN13" : "CODE128",
        width: 1.5,
        height: 35,
        displayValue: true,
        fontSize: 16,
        textMargin: 1,
        margin: 0,
      });

      const barcodeDataUrl = canvas.toDataURL("image/png");

      // Draw Name (Top center, removing tones to support native jsPDF fonts)
      doc.setFontSize(8);
      const safeName = removeVietnameseTones(p.name);
      
      // Limit name length roughly to fit one line
      const shortName = safeName.length > 28 ? safeName.substring(0, 25) + "..." : safeName;
      doc.text(shortName, pageWidth / 2, 4, { align: "center" });

      // Ensure price is visible
      const priceStr = new Intl.NumberFormat("vi-VN").format(p.price) + " d";
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      const priceY = 8;
      doc.text(priceStr, pageWidth / 2, priceY, { align: "center" });

      // Add Barcode Image
      doc.addImage(barcodeDataUrl, "PNG", 5, priceY + 2, pageWidth - 10, pageHeight - priceY - 6);

    } catch (err) {
      console.error(`Failed to generate barcode for ${p.name}`, err);
      doc.setFontSize(8);
      doc.text("Loi Barcode", pageWidth / 2, pageHeight / 2, { align: "center" });
    }
  }

  doc.save("product-barcodes.pdf");
};
