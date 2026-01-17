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
  const [form, setForm] = useState({});
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (!timesheet) return;
    setForm({ ...timesheet });
    getTimesheetAttachments(token, timesheet.Id).then(setAttachments);
  }, [timesheet]);

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function save(statusOverride) {
    await updateTimesheetRecord(token, timesheet.Id, {
      ...form,
      Status: statusOverride || form.Status,
    });
    onSaved();
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>Edit Timesheet</h3>

        <div className="form-grid">
          <input
            type="number"
            value={form.TotalHours || ""}
            onChange={(e) => update("TotalHours", e.target.value)}
            placeholder="Total Hours"
          />
          <input
            type="number"
            value={form.BillableHours || ""}
            onChange={(e) => update("BillableHours", e.target.value)}
            placeholder="Billable Hours"
          />
          <textarea
            value={form.WorkDescription || ""}
            onChange={(e) => update("WorkDescription", e.target.value)}
            placeholder="Work Description"
          />
        </div>

        <h4>Attachments</h4>
        {attachments?.length ? (
          <ul>
            {attachments.map((f) => (
              <li key={f.FileName}>
                <a href={f.ServerRelativeUrl} target="_blank" rel="noreferrer">
                  {f.FileName}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No attachments</p>
        )}

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => save()}>Save</button>
          {form.Status !== "HR Approved" && (
            <button onClick={() => save("HR Approved")}>HR Approve</button>
          )}
        </div>
      </div>
    </div>
  );
}
