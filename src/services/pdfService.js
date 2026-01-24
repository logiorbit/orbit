import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function safeAmount(value) {
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

function drawWatermark(doc, status) {
  if (!status) return;

  let text = "";

  switch (status) {
    case "Draft":
      text = "DRAFT";
      break;

    case "HR Approved":
      text = "HR APPROVED";
      break;

    case "Paid":
      text = "PAID";
      break;

    // All verified / issued states
    case "HOD Approved":
    case "Client Verified":
    case "EInvoice":
    case "Sent":
      text = "APPROVED";
      break;

    default:
      return;
  }

  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFontSize(50);
    doc.setTextColor(180, 180, 180);
    doc.setFont("helvetica", "bold");

    doc.text(text, 105, 150, {
      align: "center",
      angle: 45,
    });
  }

  // Reset color for rest of content
  doc.setTextColor(0, 0, 0);
}

export async function generateInvoicePDF({ invoice, lineItems, client }) {
  const doc = new jsPDF("p", "mm", "a4");

  /* ===============================
     HEADER STRIP
     =============================== */
  doc.setFillColor(207, 226, 243);
  doc.rect(10, 10, 190, 14, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 105, 19, { align: "center" });

  doc.setFontSize(9);
  doc.text(`INVOICE NO: ${invoice.InvoiceID}`, 140, 17);
  doc.text(
    `DATE: ${new Date(invoice.Created || Date.now()).toLocaleDateString("en-GB")}`,
    140,
    22,
  );

  /* ===============================
     COMPANY INFO (STATIC)
     =============================== */
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Logivention Technologies Pvt. Ltd.", 10, 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    [
      "Office No: 408, Pride Icon, MH SH27,",
      "Pune Nashik Highway, Kharadi,",
      "Pune, Maharashtra, 411014",
      "Phone: 8888744254 | support@logivention.in",
      "GSTIN: 27AAECL6024G1ZN",
      "PAN: AAECL6024G",
    ],
    10,
    36,
  );

  /* ===============================
     CLIENT BLOCK
     =============================== */
  doc.setDrawColor(0);
  doc.rect(10, 62, 90, 26);

  doc.setFont("helvetica", "bold");
  doc.text("To,", 12, 68);

  doc.setFont("helvetica", "normal");
  doc.text(
    [
      client?.ClientName || "",
      client?.Address || "",
      `GSTIN: ${client?.GSTIN || "-"}`,
    ],
    12,
    73,
  );

  /* ===============================
     LINE ITEMS TABLE
     =============================== */
  const tableRows = lineItems.map((l) => [
    l.Description || "Salesforce Development",
    l.HSNSAC || "998314",
    l.WorkingUnits,
    safeAmount(l.RateValue),
    safeAmount(l.LineTotal),
  ]);

  autoTable(doc, {
    startY: 95,
    head: [["Particulars (Description)", "HSN / SAC", "Qty", "Rate", "Amount"]],
    body: tableRows,
    styles: {
      fontSize: 8,
    },
    headStyles: {
      fillColor: [230, 230, 230],
    },
  });

  /* ===============================
     TOTALS
     =============================== */
  /*  let y = doc.lastAutoTable.finalY + 5;

  doc.text(`Total`, 140, y);
  doc.text(invoice.SubTotal.toFixed(2), 180, y, { align: "right" });

  y += 5;
  doc.text(`Add: CGST`, 140, y);
  doc.text(invoice.CGSTAmount?.toFixed(2) || "0.00", 180, y, {
    align: "right",
  });

  y += 5;
  doc.text(`Add: SGST`, 140, y);
  doc.text(invoice.SGSTAmount?.toFixed(2) || "0.00", 180, y, {
    align: "right",
  });

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total`, 140, y);
  doc.text(invoice.GrandTotal.toFixed(2), 180, y, { align: "right" }); **/

  /* ===============================
   GST BREAKUP TABLE
   =============================== */

  const gstRows = [];

  if (invoice.CGSTPercent && invoice.CGSTAmount) {
    gstRows.push([
      "CGST",
      `${invoice.CGSTPercent}%`,
      safeAmount(invoice.CGSTAmount),
    ]);
  }

  if (invoice.SGSTPercent && invoice.SGSTAmount) {
    gstRows.push([
      "SGST",
      `${invoice.SGSTPercent}%`,
      safeAmount(invoice.SGSTAmount),
    ]);
  }

  if (invoice.IGSTPercent && invoice.IGSTAmount) {
    gstRows.push([
      "IGST",
      `${invoice.IGSTPercent}%`,
      safeAmount(invoice.IGSTAmount),
    ]);
  }

  gstRows.push(["Grand Total", "", safeAmount(invoice.GrandTotal)]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    head: [["Tax Type", "Rate", "Amount"]],
    body: gstRows,
    styles: {
      fontSize: 8,
    },
    columnStyles: {
      2: { halign: "right" },
    },
  });

  const y = doc.lastAutoTable.finalY;

  /* ===============================
     AMOUNT IN WORDS
     =============================== */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `Total Amount (INR - In Words): ${invoice.AmountInWords}`,
    10,
    y + 10,
  );

  /* ===============================
     FOOTER (STATIC)
     =============================== */
  doc.text(
    [
      "Payment Terms:",
      "1. Payment within 35 days",
      "2. This is a digital invoice",
      "",
      "For Logivention Technologies Pvt. Ltd.",
    ],
    10,
    y + 20,
  );

  drawWatermark(doc, invoice.InvoiceStatus);

  return doc;
}
