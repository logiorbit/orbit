import { useEffect, useState } from "react";
import { getApprovedTimesheetsByClient } from "../../services/sharePointService";

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
                        <td>{ts.Employee?.EmployeeName}</td>
                        <td>{ts.Month}</td>
                        <td>{ts.Year}</td>
                        <td>{ts.TotalHours ?? "-"}</td>
                        <td>{ts.WorkingDays ?? "-"}</td>
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

          <button className="primary-btn" disabled={selectedTsIds.length === 0}>
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
