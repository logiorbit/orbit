const SITE_URL = "https://logivention.sharepoint.com/sites/LogiOrbit";

export async function deleteInvoiceCompletely(token, invoiceId) {
  // ORDER IS CRITICAL — DO NOT CHANGE
  await deleteInvoicePDF(token, invoiceId);
  await resetTimesheetsForInvoice(token, invoiceId);
  await deleteInvoiceTimesheetMaps(token, invoiceId);
  await deleteInvoiceHeader(token, invoiceId);
}

/**
 * Deletes invoice PDF using the actual file URL
 */
export async function deleteInvoicePDF(token, pdfUrl) {
  if (!pdfUrl) return; // No PDF to delete

  // Convert absolute URL to server-relative
  const serverRelativeUrl = pdfUrl.replace(
    "https://logivention.sharepoint.com",
    "",
  );

  const res = await fetch(
    `${SITE_URL}/_api/web/GetFileByServerRelativeUrl('${serverRelativeUrl}')`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "IF-MATCH": "*",
      },
    },
  );

  if (!res.ok && res.status !== 404) {
    throw new Error("Failed to delete invoice PDF file");
  }
}

export async function resetTimesheetsForInvoice(token, invoiceId) {
  // 1. Get mappings
  const res = await fetch(
    `${SITE_URL}/_api/web/lists/getbytitle('Invoice_Timesheet_Map')/items?$filter=InvoiceId eq ${invoiceId}&$select=TimesheetId`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=nometadata",
      },
    },
  );

  if (!res.ok) throw new Error("Failed to load invoice mappings");

  const data = await res.json();

  // 2. Reset each timesheet
  for (const map of data.value || []) {
    await fetch(
      `${SITE_URL}/_api/web/lists/getbytitle('Timesheets')/items(${map.TimesheetId})`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json;odata=nometadata",
          "IF-MATCH": "*",
        },
        body: JSON.stringify({
          TimesheetStatus: "HR Approved",
          IsInvoiced: false,
          InvoiceId: null,
          InvoiceMappedOn: null,
          InvoiceMappedBy: null,
        }),
      },
    );
  }
}

export async function deleteInvoiceTimesheetMaps(token, invoiceId) {
  const res = await fetch(
    `${SITE_URL}/_api/web/lists/getbytitle('Invoice_Timesheet_Map')/items?$filter=InvoiceId eq ${invoiceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=nometadata",
      },
    },
  );

  if (!res.ok) throw new Error("Failed to load mappings");

  const data = await res.json();

  for (const map of data.value || []) {
    await fetch(
      `${SITE_URL}/_api/web/lists/getbytitle('Invoice_Timesheet_Map')/items(${map.ID})`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "IF-MATCH": "*",
        },
      },
    );
  }
}

export async function deleteInvoiceHeader(token, invoiceId) {
  const res = await fetch(
    `${SITE_URL}/_api/web/lists/getbytitle('Invoice_Header')/items(${invoiceId})`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "IF-MATCH": "*",
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to delete Invoice Header");
  }
}
