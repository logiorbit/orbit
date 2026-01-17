import { useEffect, useState } from "react";
import {
  updateTimesheetRecord,
  getTimesheetAttachments,
  uploadTimesheetAttachments,
} from "../../services/sharePointService";

export default function EditTimesheetModal({
  token,
  timesheet,
  clients = [],
  onClose,
  onSaved,
}) {
  /* ============================
     SAME FORM MODEL AS SUBMIT
     ============================ */
  console.log(timesheet);
  const [form, setForm] = useState(null);

  /*  const [form, setForm] = useState({
    clientId: "",
    month: "",
    year: "",
    totalWorkingDays: "",
    totalLeaves: "",
    leaveDates: "",
    totalHolidays: "",
    holidayDates: "",
    totalBillingDays: "",
    totalBillingHours: "",
    attachments: [],
  }); */

  const [existingAttachments, setExistingAttachments] = useState([]);
  const [saving, setSaving] = useState(false);

  console.log("EDIT TIMESHEET:", timesheet);

  /* ============================
     PREFILL FROM SHAREPOINT
     ============================ */
  useEffect(() => {
    if (!timesheet?.Id || !token) {
      console.warn(
        "EditTimesheetModal: Waiting for token or timesheet data..."
      );
      return;
    }

    setForm({
      clientId: timesheet.Client?.Id ? String(timesheet.Client.Id) : "",
      month: timesheet.Month || "",
      year: timesheet.Year || "",
      totalWorkingDays: timesheet.TotalWorkingDays || "",
      totalLeaves: timesheet.TotalLeaves || "",
      leaveDates: timesheet.LeaveDates || "",
      totalHolidays: timesheet.TotalHolidays || "",
      holidayDates: timesheet.HolidayDates || "",
      totalBillingDays: timesheet.TotalBillingDays || "",
      totalBillingHours: timesheet.TotalBillingHours || "",
      attachments: [],
    });

    // Fetch Attachments
    getTimesheetAttachments(token, timesheet.Id)
      .then((files) => {
        console.log("Fetched Attachments:", files);
        // Ensure we are setting an array [cite: 28, 195]
        setExistingAttachments(Array.isArray(files) ? files : []);
      })
      .catch((err) => {
        console.error("Error fetching attachments:", err);
        setExistingAttachments([]);
      });
  }, [timesheet, token]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  /* ============================
     SAVE HANDLER
     ============================ */
  async function handleSave(statusOverride) {
    setSaving(true);
    try {
      await updateTimesheetRecord(token, timesheet.Id, {
        ClientId: form.clientId ? parseInt(form.clientId) : null,
        Month: form.month,
        Year: form.year,
        TotalWorkingDays: form.totalWorkingDays,
        TotalLeaves: form.totalLeaves,
        LeaveDates: form.leaveDates,
        TotalHolidays: form.totalHolidays,
        HolidayDates: form.holidayDates,
        TotalBillingDays: form.totalBillingDays,
        TotalBillingHours: form.totalBillingHours,
        Status: statusOverride || timesheet.Status,
      });

      if (form.attachments.length > 0) {
        await uploadTimesheetAttachments(token, timesheet.Id, form.attachments);
      }

      await onSaved();
      onClose();
    } catch (err) {
      console.error("Edit failed", err);
      alert("Failed to update timesheet");
    } finally {
      setSaving(false);
    }
  }

  /* ============================
     RENDER (CLONED FROM SUBMIT)
     ============================ */
  if (!form) {
    return null;
  }
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>
          Edit Timesheet
          <span className="modal-subtitle">
            {" "}
            - {timesheet.Employee?.Title || "Unknown Employee"}
          </span>
        </h2>

        <div className="form-grid">
          <div>
            <div className="form-group">
              <label>Client *</label>
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.Id} value={c.Id}>
                    {c.Title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Month</label>
            <select
              value={form.month}
              onChange={(e) => updateField("month", e.target.value)}
            >
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => updateField("year", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Total Working Days</label>
            <input
              type="number"
              value={form.totalWorkingDays}
              onChange={(e) => updateField("totalWorkingDays", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Total Leaves</label>
            <input
              type="number"
              value={form.totalLeaves}
              onChange={(e) => updateField("totalLeaves", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Total Holidays</label>
            <input
              type="number"
              value={form.totalHolidays}
              onChange={(e) => updateField("totalHolidays", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Total Billing Days</label>
            <input
              type="number"
              value={form.totalBillingDays}
              onChange={(e) => updateField("totalBillingDays", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Total Billing Hours</label>
            <input
              type="number"
              value={form.totalBillingHours}
              onChange={(e) => updateField("totalBillingHours", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Leave Dates</label>
            <textarea
              value={form.leaveDates}
              onChange={(e) => updateField("leaveDates", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Holiday Dates</label>
            <textarea
              value={form.holidayDates}
              onChange={(e) => updateField("holidayDates", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Attachments</label>
            <input
              type="file"
              multiple
              onChange={(e) =>
                updateField("attachments", Array.from(e.target.files))
              }
            />
          </div>
        </div>

        {/* EXISTING ATTACHMENTS VIEWER */}
        <div className="attachments-section">
          <h4>Existing Attachments</h4>
          {existingAttachments.length === 0 ? (
            <p>No attachments found.</p>
          ) : (
            <div className="attachment-flex-container">
              {existingAttachments.map((f, index) => (
                <div key={f.FileName || index} className="attachment-chip">
                  <a
                    href={`https://logivention.sharepoint.com${f.ServerRelativeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    title={f.FileName}
                  >
                    <span className="file-icon">📎</span>
                    <span className="file-name">{f.FileName}</span>
                  </a>
                </div>
              ))}
            </div>
          )}
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

          {timesheet.Status !== "HR Approved" && (
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
