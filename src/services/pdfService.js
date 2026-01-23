// src/services/pdfService.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates Invoice PDF using LOCKED / LATEST invoice data
 * This function does NOT upload anything.
 * It ONLY creates the PDF document.
 */
export async function generateInvoicePDF({ invoice, lineItems, client }) {
  const doc = new jsPDF();

  /* ============================
     HEADER
     ============================ */
  doc.setFontSize(16);
  doc.text("INVOICE", 14, 20);

  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.InvoiceID || invoice.ID}`, 14, 30);
  doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, 36);

  /* ============================
     CLIENT DETAILS
     ============================ */
  doc.text(`Client: ${client?.ClientName || "-"}`, 14, 46);

  if (client?.Address) {
    doc.text(client.Address, 14, 52);
  }

  /* ============================
     LINE ITEMS TABLE
     ============================ */
  const tableRows = lineItems.map((l, index) => [
    index + 1,
    l.RateType || "-",
    l.WorkingUnits || "-",
    l.RateValue || "-",
    l.LineTotal || "-",
  ]);

  doc.autoTable({
    startY: 65,
    head: [["#", "Rate Type", "Units", "Rate", "Amount"]],
    body: tableRows,
    styles: {
      fontSize: 9,
    },
  });

  /* ============================
     TOTALS
     ============================ */
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.text(`Sub Total: ${invoice.SubTotal || "0"}`, 140, finalY);
  doc.text(`Tax: ${invoice.TaxTotal || "0"}`, 140, finalY + 6);
  doc.text(`Grand Total: ${invoice.GrandTotal || "0"}`, 140, finalY + 12);

  return doc;
}
