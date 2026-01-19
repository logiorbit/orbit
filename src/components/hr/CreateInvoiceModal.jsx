import { useEffect, useState } from "react";
import {
  getApprovedTimesheetsByClient,
  createInvoiceHeader,
  createInvoiceTimesheetMap,
  markTimesheetInvoiced,
  getEmployeeClientAssignment,
} from "../../services/sharePointService";

/**
 * CreateInvoiceModal
 *
 * Responsibilities:
 * - Select client
 * - Load HR-approved, not-invoiced timesheets
 * - Select timesheets
 * - Create Draft Invoice + mapping records
 */
export default function CreateInvoiceModal({
  clients = [],
  token,
  month,
  year,
  onClose,
}) {
  /* =========================
     1️⃣ STATE
     ========================= */
  const [selectedClient, setSelectedClient] = useState("");
  const [timesheets, setTimesheets] = useState([]);
  const [loadingTs, setLoadingTs] = useState(false);
  const [selectedTsIds, setSelectedTsIds] = useState([]);
  const [saving, setSaving] = useState(false);

  /* =========================
     2️⃣ HELPER — CALCULATION
     (Draft-only logic)
     ========================= */
  function calculateLine(ts, assignment, client) {
    const { RateType, RateValue } = assignment;

    if (RateType === "Hour") {
      return {
        units: ts.TotalHours,
        amount: ts.TotalHours * RateValue,
      };
    }

    if (RateType === "Day") {
      const days =
        client?.FixedWorkingDays != null
          ? client.FixedWorkingDays
          : ts.WorkingDays;

      return {
        units: days,
        amount: days * RateValue,
      };
    }

    // Month
    return {
      units: 1,
      amount: RateValue,
    };
  }

  /* =========================
     3️⃣ LOAD TIMESHEETS
     ========================= */
  useEffect(() => {
    if (!selectedClient) {
      setTimesheets([]);
      setSelectedTsIds([]);
      return;
    }

    async function loadTimesheets() {
      setLoadingTs(true);
      try {
        const data = await getApprovedTimesheetsByClient(token, selectedClient);
        setTimesheets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load timesheets:", err);
        setTimesheets([]);
      } finally {
        setLoadingTs(false);
      }
    }

    loadTimesheets();
  }, [selectedClient, token]);

  /* =========================
     4️⃣ SAVE HANDLER
     ========================= */
  async function handleSave() {
    if (!selectedClient || selectedTsIds.length === 0 || saving) return;
    const SITE_URL = "https://logivention.sharepoint.com/sites/LogiOrbit";

    setSaving(true);

    try {
      // Resolve selected client metadata (for FixedWorkingDays, etc.)
      const clientMeta = clients.find((c) => c.ID === Number(selectedClient));

      /* 1️⃣ Create Invoice Header (Draft) */
      const invoice = await createInvoiceHeader(token, {
        ClientId: Number(selectedClient), // Lookup → number (correct)
        InvoiceMonth: String(month), // Choice/Text → string
        InvoiceYear: String(year), // TEXT → string (FIX)
        InvoiceStatus: "Draft", // Choice → string
        IsLocked: false, // TEXT → string (FIX)
      });

      let subTotal = 0;

      /* 2️⃣ Process each selected timesheet */
      for (const ts of timesheets.filter((t) => selectedTsIds.includes(t.ID))) {
        const assignment = await getEmployeeClientAssignment(
          token,
          ts.Employee.ID,
          Number(selectedClient),
        );

        if (!assignment) {
          throw new Error(`Rate not found for Employee ${ts.Employee.Id}`);
        }

        const { units, amount } = calculateLine(ts, assignment, clientMeta);

        subTotal += amount;

        /* 3️⃣ Create mapping (snapshot) */
        await createInvoiceTimesheetMap(token, {
          InvoiceId: invoice.ID,
          TimesheetId: ts.ID,
          RateType: assignment.RateType,
          RateValue: assignment.RateValue,
          WorkingUnits: units,
          LineTotal: amount,
          IsEditable: true,
        });

        /* 4️⃣ Mark timesheet invoiced */
        await markTimesheetInvoiced(token, ts.ID, invoice.ID);
      }

      /* 5️⃣ Update invoice totals */
      await fetch(
        `${SITE_URL}/_api/web/lists/getbytitle('Invoice_Header')/items(${invoice.ID})`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json;odata=nometadata",
            "IF-MATCH": "*",
          },
          body: JSON.stringify({
            SubTotal: subTotal,
            TaxTotal: 0,
            GrandTotal: subTotal,
          }),
        },
      );

      onClose();
    } catch (err) {
      console.error("Invoice creation failed:", err);
      alert("Failed to create invoice. Check console for details.");
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     5️⃣ RENDER
     ========================= */
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
                <option key={c.ID} value={c.ID}>
                  {c.Title}
                </option>
              ))}
            </select>
          </div>

          {/* Timesheet Grid */}
          <div className="timesheet-grid">
            {loadingTs ? (
              <p>Loading approved timesheets...</p>
            ) : timesheets.length === 0 ? (
              <p>No approved timesheets available for this client.</p>
            ) : (
              <table className="hr-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Employee</th>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Hours</th>
                    <th>Days</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets.map((ts) => (
                    <tr key={ts.ID}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedTsIds.includes(ts.ID)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTsIds((prev) => [...prev, ts.ID]);
                            } else {
                              setSelectedTsIds((prev) =>
                                prev.filter((id) => id !== ts.ID),
                              );
                            }
                          }}
                        />
                      </td>
                      <td>{ts.Employee?.Title}</td>
                      <td>{ts.Month}</td>
                      <td>{ts.Year}</td>
                      <td>{ts.TotalBillingHours ?? "-"}</td>
                      <td>{ts.TotalBillingDays ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button
            className="primary-btn"
            disabled={selectedTsIds.length === 0 || saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
