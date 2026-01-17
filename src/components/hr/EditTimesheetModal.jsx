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
  const [form, setForm] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      Hours: timesheet.Hours,
      Comments: timesheet.Comments,
      Status: timesheet.Status,
    });

    loadAttachments();
  }, [timesheet]);

  async function loadAttachments() {
    const files = await getTimesheetAttachments(token, timesheet.Id);
    setAttachments(files || []);
  }

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSave(statusOverride) {
    setSaving(true);
    try {
      await updateTimesheetRecord(token, timesheet.Id, {
        ...form,
        Status: statusOverride || form.Status,
      });

      onSaved();
      onClose();
    } catch (error) {
      console.error("Failed to save timesheet:", error);
      alert("Failed to save timesheet.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Edit Timesheet</h3>

        <label>Hours</label>
        <input
          type="number"
          value={form.Hours || ""}
          onChange={(e) => updateField("Hours", e.target.value)}
        />

        <label>Comments</label>
        <textarea
          value={form.Comments || ""}
          onChange={(e) => updateField("Comments", e.target.value)}
        />

        <label>Status</label>
        <input value={form.Status} disabled />

        {/* Attachments */}
        <h4>Attachments</h4>
        <ul>
          {attachments.map((a) => (
            <li key={a.Id}>
              <a href={a.ServerRelativeUrl} target="_blank">
                {a.FileName}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>

          <button disabled={saving} onClick={() => handleSave()}>
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
