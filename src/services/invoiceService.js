const SITE_URL = "https://logivention.sharepoint.com/sites/LogiOrbit";

/**
 * updateInvoiceTotals
 *
 * @param {string} token
 * @param {number} invoiceId
 * @param {number} subTotal
 * @param {object} clientMeta
 */
export async function updateInvoiceTotals(
  token,
  invoiceId,
  subTotal,
  clientMeta,
) {
  /* =========================
     1️⃣ TAX CALCULATION
     ========================= */

  let CGSTPercent = 0;
  let SGSTPercent = 0;
  let IGSTPercent = 0;

  let CGSTAmount = 0;
  let SGSTAmount = 0;
  let IGSTAmount = 0;

  // Outside India → No tax
  if (clientMeta?.ClientLocation === "Outside India") {
    // All zero
  }

  // Inside India
  else if (clientMeta?.ClientLocation === "India") {
    // Maharashtra → CGST + SGST
    if (clientMeta?.State === "Maharashtra") {
      CGSTPercent = 9;
      SGSTPercent = 9;

      CGSTAmount = (subTotal * CGSTPercent) / 100;
      SGSTAmount = (subTotal * SGSTPercent) / 100;
    }

    // Outside Maharashtra → IGST
    else {
      IGSTPercent = 18;
      IGSTAmount = (subTotal * IGSTPercent) / 100;
    }
  }

  /* =========================
     2️⃣ TOTALS
     ========================= */

  const VAT = 0; // Explicit
  const TaxTotal = CGSTAmount + SGSTAmount + IGSTAmount;
  const GrandTotal = subTotal + TaxTotal + VAT;

  /* =========================
     3️⃣ PATCH INVOICE HEADER
     ========================= */

  const payload = {
    SubTotal: subTotal,
    CGST,
    SGST,
    IGST,
    VAT,
    TaxTotal,
    GrandTotal,
    InvoiceStatus: "Generated",
    IsLocked: true,
    LockReason: "Invoice generated and totals finalized",
  };

  const res = await fetch(
    `${SITE_URL}/_api/web/lists/getbytitle('Invoice_Header')/items(${invoiceId})`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json;odata=nometadata",
        "IF-MATCH": "*",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Invoice totals update failed: ${text}`);
  }

  return {
    ...payload,
    InvoiceId: invoiceId,
  };
}
