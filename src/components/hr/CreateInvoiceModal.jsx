import { useEffect, useState } from "react";
import {
  getApprovedTimesheetsByClient,
  createInvoiceHeader,
  createInvoiceTimesheetMap,
  markTimesheetInvoiced,
  getEmployeeClientAssignment,
} from "../../services/sharePointService";
import { updateInvoiceTotals } from "../../services/invoiceService";

import { syncInvoicePDF } from "../../services/invoicePdfSyncService";

/**
 * CreateInvoiceModal
 *
 * Responsibilities:
 * - Select client
 * - Load HR-approved, not-invoiced timesheets
 * - Select timesheets
 * - Create Draft Invoice + mapping records
 * - Calculate GST based on Client_Master rules
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
     2️⃣ HELPER — LINE CALCULATION
     ========================= */
  function calculateLine(ts, assignment, client) {
    const { RateType, RateValue } = assignment;

    if (RateType === "Hour") {
      return {
        units: ts.TotalBillingHours,
        amount: ts.TotalBillingHours * RateValue,
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
     3️⃣ LOAD APPROVED TIMESHEETS
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
      /* Resolve client metadata */
      const clientMeta = clients.find((c) => c.ID === Number(selectedClient));

      /* 1️⃣ Create Invoice Header (Draft) */
      const invoice = await createInvoiceHeader(token, {
        Title: `Invoice - ${clientMeta.Title}`,
        //  InvoiceID: `INV-${year}-${String(invoiceId).padStart(4, "0")}`,
        InvoiceDate: new Date().toISOString(),
        Currency: clientMeta.Currency || "INR",
        ClientId: Number(selectedClient),
        InvoiceMonth: String(month),
        InvoiceYear: String(year),
        InvoiceStatus: "Draft",
        IsLocked: false,
      });

      let subTotal = 0;

      /* 2️⃣ Process selected timesheets */
      for (const ts of timesheets.filter((t) => selectedTsIds.includes(t.ID))) {
        const assignment = await getEmployeeClientAssignment(
          token,
          ts.EmployeeHierarchy.ID,
          Number(selectedClient),
        );

        if (!assignment) {
          throw new Error(
            `Rate not found for Employee ${ts.EmployeeHierarchy.ID}`,
          );
        } else {
          console.log("Your Rate is----", assignment);
        }

        const { units, amount } = calculateLine(ts, assignment, clientMeta);
        console.log("Your Calculated Line is----", amount);
        subTotal += amount;

        /* Create mapping snapshot */
        await createInvoiceTimesheetMap(token, {
          Title: `Invoice ${invoice.ID} - TS ${ts.ID}`,
          MapID: `INV-${invoice.ID}-TS-${ts.ID}`,
          InvoiceId: invoice.ID,
          TimesheetId: ts.ID,
          RateType: assignment.RateType,
          RateValue: assignment.RateValue,
          WorkingUnits: units,
          LineTotal: amount,
          IsEditable: true,
        });

        /* Mark timesheet invoiced */
        await markTimesheetInvoiced(token, ts.ID, invoice.ID, assignment.ID);
      }

      /* =========================
   3️⃣ FINALIZE TOTALS
   ========================= */

      await updateInvoiceTotals(token, invoice.ID, subTotal, clientMeta);

      /* 5️⃣ Generate + Sync PDF (always latest data) */
      await syncInvoicePDF(token, invoice.ID);

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
        <div className="modal-header">
          <h3>Create Invoice</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
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
