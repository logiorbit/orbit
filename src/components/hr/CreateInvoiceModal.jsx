import { useState } from "react";

export default function CreateInvoiceModal({ clients = [], onClose }) {
  const [selectedClient, setSelectedClient] = useState("");

  return (
    <div className="modal-overlay">
      <div className="modal-card large">
        {/* Header */}
        <div className="modal-header">
          <h3>Create Invoice</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Client Selection */}
          <div className="form-group">
            <label>Select Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">-- Select Client --</option>
              {clients.map((c) => (
                <option key={c.Id} value={c.Id}>
                  {c.Title}
                </option>
              ))}
            </select>
          </div>

          {/* Placeholder for Approved Timesheets */}
          <div className="placeholder-box">
            <p>Approved timesheets for selected client will appear here.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="primary-btn" disabled>
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
