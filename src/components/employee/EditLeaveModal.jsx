import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import { updateLeaveRequest } from "../../services/sharePointService";

export default function EditLeaveModal({ leave, onClose, onSuccess }) {
  const { instance, accounts } = useMsal();

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // ✅ CRITICAL FIX — hydrate from leave
  useEffect(() => {
    if (!leave) return;

    setForm({
      leaveType: leave.LeaveType?.Title || "",
      startDate: leave.StartDate?.split("T")[0],
      endDate: leave.EndDate?.split("T")[0],
      reason: leave.Reason || "",
    });
  }, [leave]);

  async function submit() {
    const token = await getAccessToken(instance, accounts[0]);

    // const utcDate = new Date(form.startDate + "T00:00:00");
    // const isoDate = utcDate.toISOString();
    // const utcDate2 = new Date(form.endDate + "T00:00:00");
    // const isoDate2 = utcDate2.toISOString();

    const [year, month, day] = form.startDate.split("-");
    const isoDate = new Date(Date.UTC(year, month - 1, day)).toISOString();
    const [year2, month2, day2] = form.endDate.split("-");
    const isoDate2 = new Date(Date.UTC(year2, month2 - 1, day2)).toISOString();

    await updateLeaveRequest(token, leave.Id, {
      StartDate: isoDate,
      EndDate: isoDate2,
      Reason: form.reason,
    });

    onSuccess();
    window.location.reload();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Edit Leave</h3>

        <div className="form-group">
          <label>Leave Type</label>

          <select
            value={form.leaveType}
            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
            required
          >
            <option value="">Select</option>
            <option>PTO</option>
            <option>WFH</option>
            <option>CompOff</option>
            <option>Maternity</option>
            <option>Paternity</option>
            <option>Grievance</option>
          </select>
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Reason</label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
          />
        </div>

        <div className="modal-actions">
          <button className="primary-btn" onClick={submit}>
            Save
          </button>
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
