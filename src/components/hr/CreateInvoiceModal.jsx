import { useEffect, useState } from "react";
import { getApprovedTimesheetsByClient } from "../../services/sharePointService";
import {
  createInvoiceHeader,
  createInvoiceTimesheetMap,
  markTimesheetInvoiced,
  getEmployeeClientAssignment,
} from "../../services/sharePointService";

export default function CreateInvoiceModal({ clients = [], token, onClose }) {
  const [selectedClient, setSelectedClient] = useState("");
  const [timesheets, setTimesheets] = useState([]);
  const [loadingTs, setLoadingTs] = useState(false);
  const [selectedTsIds, setSelectedTsIds] = useState([]);

  useEffect(() => {
    if (!selectedClient) {
      setTimesheets([]);
      return;
    }

    function calculateLine(ts, assignment, client) {
      const { RateType, RateValue } = assignment;

      if (RateType === "Hour") {
        return {
          units: ts.TotalHours,
          amount: ts.TotalHours * RateValue,
        };
      }

      if (RateType === "Day") {
        const days = client.FixedWorkingDays ?? ts.WorkingDays;
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

    async function loadTimesheets() {
      setLoadingTs(true);
      try {
        const data = await getApprovedTimesheetsByClient(token, selectedClient);
        setTimesheets(data);
        console.log("THe data is---", data);
      } catch (err) {
        console.error(err);
        setTimesheets([]);
      } finally {
        setLoadingTs(false);
      }
    }

    loadTimesheets();
  }, [selectedClient, token]);

  async function handleSave() {
    if (!selectedClient || selectedTsIds.length === 0) return;

    try {
      // 1️⃣ Create Invoice Header (Draft)
      const invoice = await createInvoiceHeader(token, {
        ClientId: selectedClient,
        InvoiceMonth: month,
        InvoiceYear: year,
        InvoiceStatus: "Draft",
        IsLocked: false,
      });

      let subTotal = 0;

      // 2️⃣ Process each selected timesheet
      for (const ts of timesheets.filter((t) => selectedTsIds.includes(t.ID))) {
        const assignment = await getEmployeeClientAssignment(
          token,
          ts.Employee.Id,
          selectedClient,
        );

        if (!assignment) {
          throw new Error("Rate not found for employee/client");
        }

        const { units, amount } = calculateLine(ts, assignment, clientMeta);

        subTotal += amount;

        // 3️⃣ Create mapping row (snapshot)
        await createInvoiceTimesheetMap(token, {
          InvoiceId: invoice.ID,
          TimesheetId: ts.ID,
          RateType: assignment.RateType,
          RateValue: assignment.RateValue,
          WorkingUnits: units,
          LineTotal: amount,
          IsEditable: true,
        });

        // 4️⃣ Mark timesheet invoiced
        await markTimesheetInvoiced(token, ts.ID, invoice.ID);
      }

      // 5️⃣ Update invoice totals
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
      console.error(err);
      alert("Failed to create invoice");
    }
  }

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
                                setSelectedTsIds([...selectedTsIds, ts.ID]);
                              } else {
                                setSelectedTsIds(
                                  selectedTsIds.filter((id) => id !== ts.ID),
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
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button
            className="primary-btn"
            disabled={selectedTsIds.length === 0}
            onClick={handleSave}
          >
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
