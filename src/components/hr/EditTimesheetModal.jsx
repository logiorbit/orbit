import { useEffect, useState } from "react";
import {
  updateTimesheetRecord,
  getTimesheetAttachments,
} from "../../services/sharePointService";

export default function EditTimesheetModal({
  token,
  timesheet,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);

  /* ============================
     INITIALIZE FORM (EXACTLY LIKE SUBMIT)
     ============================ */
  useEffect(() => {
    if (!timesheet) return;

    setForm({
      Client: timesheet.Client || "",
      Month: timesheet.Month || "",
      Year: timesheet.Year || "",
      TotalWorkingDays: timesheet.TotalWorkingDays || "",
      TotalLeaves: timesheet.TotalLeaves || "",
      LeaveDates: timesheet.LeaveDates || "",
      TotalHolidays: timesheet.TotalHolidays || "",
      HolidayDates: timesheet.HolidayDates || "",
      TotalBillingDays: timesheet.TotalBillingDays || "",
      TotalBillingHours: timesheet.TotalBillingHours || "",
      Status: timesheet.Status || "Submitted",
    });

    getTimesheetAttachments(token, timesheet.Id).then((files) => {
      setAttachments(Array.isArray(files) ? files : []);
    });
  }, [timesheet, token]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(statusOverride) {
    setSaving(true);
    try {
      await updateTimesheetRecord(token, timesheet.Id, {
        ...form,
        Status: statusOverride || form.Status,
      });
      await onSaved();
      onClose();
    } catch (e) {
      console.error("Update failed", e);
      alert("Failed to update timesheet");
    } finally {
      setSaving(false);
    }
  }

  if (!form) return null;

  /* ============================
     RENDER — SAME STRUCTURE AS SUBMIT MODAL
     ============================ */
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Edit Timesheet</h2>

        <div className="form-grid">
          <div>
            <label>Client</label>
            <input value={form.Client} disabled />
          </div>

          <div>
            <label>Month</label>
            <input value={form.Month} disabled />
          </div>

          <div>
            <label>Year</label>
            <input value={form.Year} disabled />
          </div>

          <div>
            <label>Total Working Days</label>
            <input
              type="number"
              value={form.TotalWorkingDays}
              onChange={(e) => updateField("TotalWorkingDays", e.target.value)}
            />
          </div>

          <div>
            <label>Total Leaves</label>
            <input
              type="number"
              value={form.TotalLeaves}
              onChange={(e) => updateField("TotalLeaves", e.target.value)}
            />
          </div>

          <div>
            <label>Total Holidays</label>
            <input
              type="number"
              value={form.TotalHolidays}
              onChange={(e) => updateField("TotalHolidays", e.target.value)}
            />
          </div>

          <div>
            <label>Total Billing Days</label>
            <input
              type="number"
              value={form.TotalBillingDays}
              onChange={(e) => updateField("TotalBillingDays", e.target.value)}
            />
          </div>

          <div>
            <label>Total Billing Hours</label>
            <input
              type="number"
              value={form.TotalBillingHours}
              onChange={(e) => updateField("TotalBillingHours", e.target.value)}
            />
          </div>

          <div className="full-width">
            <label>Leave Dates</label>
            <textarea
              value={form.LeaveDates}
              onChange={(e) => updateField("LeaveDates", e.target.value)}
            />
          </div>

          <div className="full-width">
            <label>Holiday Dates</label>
            <textarea
              value={form.HolidayDates}
              onChange={(e) => updateField("HolidayDates", e.target.value)}
            />
          </div>
        </div>

        {/* ATTACHMENT VIEWER */}
        <div className="attachments">
          <h4>Attachments</h4>
          {attachments.length === 0 && <p>No attachments</p>}
          <ul>
            {attachments.map((f) => (
              <li key={f.FileName}>
                <a href={f.ServerRelativeUrl} target="_blank" rel="noreferrer">
                  {f.FileName}
                </a>
              </li>
            ))}
          </ul>
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
