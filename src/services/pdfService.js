import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import companyLogo from "../assets/company-logo2.png";

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

function numberToWordsINR(amount) {
  const num = Math.floor(Number(amount));

  if (isNaN(num) || num === 0) {
    return "Zero Only";
  }

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertBelowThousand(n) {
    let str = "";

    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }

    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }

    if (n > 0) {
      str += ones[n] + " ";
    }

    return str.trim();
  }

  let words = "";
  let remainder = num;

  const crore = Math.floor(remainder / 10000000);
  remainder %= 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;

  if (crore > 0) {
    words += convertBelowThousand(crore) + " Crore ";
  }

  if (lakh > 0) {
    words += convertBelowThousand(lakh) + " Lakh ";
  }

  if (thousand > 0) {
    words += convertBelowThousand(thousand) + " Thousand ";
  }

  if (remainder > 0) {
    words += convertBelowThousand(remainder) + " ";
  }

  return `${words.trim()} Only`;
}

export async function generateInvoicePDF({ invoice, lineItems, client }) {
  console.log("The Client Is---", client);
  const doc = new jsPDF("p", "mm", "a4");

  /* ===============================
   COMPANY LOGO
   =============================== */
  doc.addImage(companyLogo, "PNG", 10, 12, 35, 12);

  /* ===============================
     HEADER STRIP
     =============================== */
  doc.setFillColor(207, 226, 243);
  doc.rect(10, 10, 190, 14, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TAX INVOICE - ${invoice.InvoiceStatus}`, 105, 19, {
    align: "center",
  });

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
      "Office No: D 605-610, The Atrium,",
      "BG Shirke Rd, Jahangir Nagar, Mundhwa,",
      "Pune, Maharastra - 411036",
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
    [`${client.ClientName}`, `${client.Address}`, `GSTIN: ${client?.GSTI}`],
    12,
    73,
  );

  /* ===============================
     LINE ITEMS TABLE
     =============================== */
  const tableRows = lineItems.map((l) => [
    l.Description,
    l.HSNSAC,
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

  if (invoice.CGST) {
    gstRows.push(["CGST", `9%`, safeAmount(invoice.CGST)]);
  }

  if (invoice.SGST) {
    gstRows.push(["SGST", `9%`, safeAmount(invoice.SGST)]);
  }

  if (invoice.IGST) {
    gstRows.push(["IGST", `18%`, safeAmount(invoice.IGST)]);
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
    `Total Amount (${client.Currency} - In Words): ${numberToWordsINR(invoice.GrandTotal)}`,
    10,
    y + 10,
  );

  /* ===============================
     FOOTER (STATIC)
     =============================== */
  doc.text(
    [
      "Related Terms & Conditions:",
      "1. Payment term 30 days",
      "2. This is a digital invoice and does not require a physical signature.",
      "3. Details for payment:",
      "   Account Name: LOGIVENTION TECHNOLOGIES PVT LTD",
      "   Account Number: 50200058253880",
      "   IFSC Code: HDFC0005974",
      "   Bank Name: HDFC Bank",
      "   MICR:  411240086",
      "   SWIFT CODE: HDFCINBB",
      "For Logivention Technologies Pvt. Ltd.",
    ],
    10,
    y + 20,
  );

  //drawWatermark(doc, invoice.InvoiceStatus);

  return doc;
}
