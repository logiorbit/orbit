import React from "react";

export default function InvoiceStatusTable({
  invoices,
  loading,
  month,
  year,
  userRole, // "HR" | "HOD"
  onCreateInvoice,
  onApproveByHR,
  onApproveByHOD,
  onClientVerified,
  onGenerateEInvoice,
}) {
  /* ===============================
     1️⃣ STATUS BADGE RENDERING
     =============================== */
  const renderStatus = (status) => {
    switch (status) {
      case "Draft":
        return <span className="status-badge draft">Draft</span>;
      case "HR Approved":
        return <span className="status-badge warning">HR Approved</span>;
      case "HOD Approved":
        return <span className="status-badge approved">HOD Approved</span>;
      case "Client Verified":
        return <span className="status-badge info">Client Verified</span>;
      case "EInvoice":
        return <span className="status-badge info">E-Invoice</span>;
      case "Sent":
        return <span className="status-badge sent">Sent</span>;
      case "Paid":
        return <span className="status-badge paid">Paid</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  /* ===============================
     2️⃣ ACTION BUTTON RENDERING
     (THIS IS WHAT YOU ASKED ABOUT)
     =============================== */
  const renderActions = (invoice) => {
    const status = invoice.InvoiceStatus;

    // Draft → HR Approved
    if (status === "Draft" && userRole === "HR") {
      return (
        <button
          className="secondary-btn"
          onClick={() => onApproveByHR(invoice)}
        >
          Approve (HR)
        </button>
      );
    }

    // HR Approved → HOD Approved
    if (status === "HR Approved" && userRole === "HOD") {
      return (
        <button className="primary-btn" onClick={() => onApproveByHOD(invoice)}>
          Approve (HOD)
        </button>
      );
    }

    // HOD Approved → Client Verified (HR action)
    if (status === "HOD Approved" && userRole === "HR") {
      return (
        <button
          className="secondary-btn"
          onClick={() => onClientVerified(invoice)}
        >
          Mark Client Verified
        </button>
      );
    }

    // Client Verified → E-Invoice
    if (status === "Client Verified" && userRole === "HR") {
      return (
        <button
          className="primary-btn"
          onClick={() => onGenerateEInvoice(invoice)}
        >
          Generate E-Invoice
        </button>
      );
    }

    // Everything else
    return <span className="muted">—</span>;
  };

  /* ===============================
     3️⃣ RENDER
     =============================== */
  return (
    <div className="table-card">
      {/* Header */}
      <div className="table-toolbar">
        <strong>
          Invoices — {month} {year}
        </strong>

        <button
          className="primary-btn"
          onClick={() => onCreateInvoice && onCreateInvoice()}
        >
          + Create New Invoice
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Client</th>
            <th>Status</th>
            <th>Subtotal</th>
            <th>Grand Total</th>
            <th>PDF</th>
            <th>Actions</th> {/* ✅ NEW COLUMN */}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7">Loading invoices...</td>
            </tr>
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan="7">No invoices found</td>
            </tr>
          ) : (
            invoices.map((inv) => (
              <tr key={inv.ID}>
                <td>{inv.InvoiceID || `INV-${inv.ID}`}</td>
                <td>{inv.Client?.ClientName || "-"}</td>
                <td>{renderStatus(inv.InvoiceStatus)}</td>
                <td>{inv.SubTotal ?? "-"}</td>
                <td>{inv.GrandTotal ?? "-"}</td>
                <td>
                  {inv.PDFUrl ? (
                    <a href={inv.PDFUrl.Url} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{renderActions(inv)}</td> {/* ✅ HERE */}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
