import React from "react";

export default function InvoiceStatusTable({ invoices, loading }) {
  const renderStatus = (status) => {
    switch (status) {
      case "Draft":
        return <span className="status-badge draft">Draft</span>;
      case "HR Approved":
        return <span className="status-badge approved">HR Approved</span>;
      case "HOD Approved":
        return <span className="status-badge approved">HOD Approved</span>;
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

  return (
    <div className="table-card">
      {/* Header */}
      <div className="table-toolbar">
        <strong>
          Invoices — {month} {year}
        </strong>
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
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6">Loading invoices...</td>
            </tr>
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan="6">No invoices found</td>
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
