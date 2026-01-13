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

    // console.log(leave);

    setForm({
      leaveType: leave.LeaveType?.Title || "",
      startDate: leave.StartDate?.split("T")[0],
      endDate: leave.EndDate?.split("T")[0],
      reason: leave.Reason || "",
    });
  }, [leave]);

  async function submit() {
    const token = await getAccessToken(instance, accounts[0]);

    await updateLeaveRequest(token, leave.Id, {
      StartDate: form.startDate,
      EndDate: form.endDate,
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
