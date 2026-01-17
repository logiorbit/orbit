import { useEffect, useState } from "react";
import {
  getTimesheetAttachments,
  updateTimesheetRecord,
} from "../../services/sharePointService";

export default function EditTimesheetModal({
  token,
  timesheet,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    TotalHours: "",
    BillableHours: "",
    NonBillableHours: "",
    WorkDescription: "",
    Status: "",
  });

  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);

  /* ============================
     Initialize Form (CORRECT)
     ============================ */
  useEffect(() => {
    if (!timesheet) return;

    setForm({
      TotalHours: timesheet.TotalHours ?? "",
      BillableHours: timesheet.BillableHours ?? "",
      NonBillableHours: timesheet.NonBillableHours ?? "",
      WorkDescription: timesheet.WorkDescription ?? "",
      Status: timesheet.Status ?? "",
    });

    loadAttachments(timesheet.Id);
  }, [timesheet]);

  async function loadAttachments(timesheetId) {
    const files = await getTimesheetAttachments(token, timesheetId);
    setAttachments(Array.isArray(files) ? files : []);
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(newStatus) {
    setSaving(true);
    try {
      await updateTimesheetRecord(token, timesheet.Id, {
        TotalHours: form.TotalHours,
        BillableHours: form.BillableHours,
        NonBillableHours: form.NonBillableHours,
        WorkDescription: form.WorkDescription,
        Status: newStatus || form.Status,
      });

      await onSaved();
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save timesheet");
    } finally {
      setSaving(false);
    }
  }

  /* ============================
     Render
     ============================ */
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Edit Timesheet</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div>
              <label>Total Hours</label>
              <input
                type="number"
                value={form.TotalHours}
                onChange={(e) => updateField("TotalHours", e.target.value)}
              />
            </div>

            <div>
              <label>Billable Hours</label>
              <input
                type="number"
                value={form.BillableHours}
                onChange={(e) => updateField("BillableHours", e.target.value)}
              />
            </div>

            <div>
              <label>Non-Billable Hours</label>
              <input
                type="number"
                value={form.NonBillableHours}
                onChange={(e) =>
                  updateField("NonBillableHours", e.target.value)
                }
              />
            </div>

            <div>
              <label>Status</label>
              <input value={form.Status} disabled />
            </div>

            <div className="full-width">
              <label>Work Description</label>
              <textarea
                rows={4}
                value={form.WorkDescription}
                onChange={(e) => updateField("WorkDescription", e.target.value)}
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="attachments">
            <h4>Attachments</h4>
            {attachments.length === 0 && <p>No attachments</p>}
            <ul>
              {attachments.map((a) => (
                <li key={a.FileName}>
                  <a
                    href={a.ServerRelativeUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {a.FileName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>

          <button
            className="primary-btn"
            disabled={saving}
            onClick={() => handleSave()}
          >
            Save
          </button>

          {form.Status !== "HR Approved" && (
            <button
              className="primary-btn"
              disabled={saving}
              onClick={() => handleSave("HR Approved")}
            >
              HR Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
