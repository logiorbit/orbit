import { generateInvoicePDF } from "./pdfService";
import {
  getInvoiceById,
  getInvoiceLineItems,
  uploadInvoicePDF,
  updateInvoiceStatus,
  getClientById,
} from "./sharePointService";

/**
 * Sync Invoice PDF with latest saved data
 * Regenerates ONLY if invoice is not locked
 */
export async function syncInvoicePDF(token, invoiceId) {
  // 1️⃣ Load latest invoice header
  const invoice = await getInvoiceById(token, invoiceId);
  console.log("Client ID is---", invoice);

  // 2️⃣ Guard: Do NOT regenerate after lock
  if (invoice.IsLocked === true) {
    console.log(`Invoice ${invoiceId} is locked. PDF sync skipped.`);
    return;
  }

  // 3️⃣ Load latest line items (snapshot table)
  const lineItems = await getInvoiceLineItems(token, invoiceId);

  const totalClient = await getClientById(token, invoice.ClientId);

  console.log("Total Client is---", totalClient);

  // 4️⃣ Generate PDF from latest data
  const doc = await generateInvoicePDF({
    invoice,
    lineItems,
    client: totalClient,
  });

  const pdfBlob = doc.output("blob");

  // 5️⃣ Upload (overwrite allowed while unlocked)
  const pdfUrl = await uploadInvoicePDF(token, invoiceId, pdfBlob);

  // 6️⃣ Update invoice with PDF URL (same URL reused)
  await updateInvoiceStatus(token, invoiceId, {
    PDFUrl: {
      Url: pdfUrl,
      Description: `Invoice ${invoiceId}`,
    },
  });

  console.log(`Invoice ${invoiceId} PDF synced successfully.`);
}
