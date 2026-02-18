import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useUserContext } from "../../context/UserContext";
import { getAccessToken } from "../../auth/authService";
import { submitLeaveRequest } from "../../services/sharePointService";
import { getHolidays } from "../../services/sharePointService";
import {
  getMyLeaves,
  getLeaveEntitlements,
} from "../../services/sharePointService";

export default function ApplyLeaveModal({ onClose }) {
  /* =======================
     ✅ HOOKS AT TOP LEVEL
     ======================= */
  const { instance, accounts } = useMsal();
  const { userProfile } = useUserContext();

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    halfDay: "FULL",
    reason: "",
  });

  const [days, setDays] = useState(0);
  const [loading, setLoading] = useState(false);

  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    async function loadHolidays() {
      const token = await getAccessToken(instance, accounts[0]);
      const year = new Date().getFullYear();
      const data = await getHolidays(token, year);
      setHolidays(data);
    }

    loadHolidays();
  }, []);

  /* =======================
     CALCULATE DAYS
     ======================= */
  useEffect(() => {
    if (!form.startDate || !form.endDate) {
      setDays(0);
      return;
    }

    const start = normalizeDate(form.startDate);
    const end = normalizeDate(form.endDate);

    let workingDays = getWorkingDays(start, end, holidays);

    // Half-day adjustment
    if (form.halfDay !== "FULL") {
      workingDays = 0.5;
    }

    setDays(workingDays);
  }, [form.startDate, form.endDate, form.halfDay, holidays]);

  function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  function getWorkingDays(start, end, holidays) {
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const currentStr = current.toDateString();

      if (!isWeekend(current) && !holidays.includes(currentStr)) {
        count++;
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /* =======================
     SUBMIT HANDLER
     (NO HOOKS HERE)
     ======================= */
  const submit = async () => {
    /* ======================
     R1 – Mandatory fields
     ====================== */
    if (!form.leaveType || !form.startDate || !form.endDate || !form.reason) {
      alert("All fields are mandatory.");
      return;
    }

    const start = normalizeDate(form.startDate);
    const end = normalizeDate(form.endDate);
    const today = normalizeDate(new Date());

    /* ======================
     R2 – Date sanity
     ====================== */
    if (end < start) {
      alert("End date cannot be before start date.");
      return;
    }

    /* ======================
     R3 – Past date block
     ====================== */
    // if (start < today) {
    //   alert("You cannot apply leave for past dates.");
    //   return;
    // }

    /* ======================
     R4 – Half-day rule
     ====================== */
    if (form.halfDay !== "FULL" && form.startDate !== form.endDate) {
      alert("Half-day leave is allowed only for a single day.");
      return;
    }

    setLoading(true);

    const token = await getAccessToken(instance, accounts[0]);

    /* ======================
     Fetch existing data
     ====================== */
    const [myLeaves, entitlements] = await Promise.all([
      getMyLeaves(token, userProfile.email),
      getLeaveEntitlements(token, userProfile.email, new Date().getFullYear()),
    ]);

    /* ======================
     R5 – Overlap detection
     ====================== */
    const hasOverlap = myLeaves.some((l) => {
      if (l.Status === "Rejected") return false;

      const existingStart = normalizeDate(l.StartDate);
      const existingEnd = normalizeDate(l.EndDate);

      return isOverlapping(start, end, existingStart, existingEnd);
    });

    if (hasOverlap) {
      alert("Leave overlaps with an existing leave request.");
      setLoading(false);
      return;
    }

    /* ======================
     R6 – Leave balance
     ====================== */
    const entitlement = entitlements.find(
      (e) => e.LeaveType.Title === form.leaveType,
    );

    if (!entitlement) {
      alert("Leave entitlement not configured.");
      setLoading(false);
      return;
    }

    if (days > entitlement.RemainingLeaves) {
      alert(
        `Insufficient leave balance. Remaining: ${entitlement.RemainingLeaves}`,
      );
      setLoading(false);
      return;
    }

    if (days === 0) {
      alert("Selected dates contain no working days.");
      setLoading(false);
      return;
    }

    /* ======================
     SUBMIT (ALL VALID)
     ====================== */

    //  const utcDate = new Date(form.startDate + "T00:00:00");
    //   const isoDate = utcDate.toISOString();
    //  const utcDate2 = new Date(form.endDate + "T00:00:00");
    //   const isoDate2 = utcDate2.toISOString();

    const [year, month, day] = form.startDate.split("-");
    const isoDate = new Date(Date.UTC(year, month - 1, day)).toISOString();
    const [year2, month2, day2] = form.endDate.split("-");
    const isoDate2 = new Date(Date.UTC(year2, month2 - 1, day2)).toISOString();

    await submitLeaveRequest(token, {
      leaveType: form.leaveType,
      startDate: isoDate,
      endDate: isoDate2,
      days,
      reason: form.reason,
    });

    setLoading(false);
    onClose();
    window.location.reload();
  };

  function isOverlapping(start1, end1, start2, end2) {
    return start1 <= end2 && end1 >= start2;
  }

  function normalizeDate(d) {
    return new Date(new Date(d).setHours(0, 0, 0, 0));
  }

  /* =======================
     RENDER
     ======================= */
  return (
    <div className="modal-overlay">
      <div className="modal-card premium-modal">
        <div className="modal-header">
          <h3>Apply Leave</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Leave Type</label>
              <select
                value={form.leaveType}
                onChange={(e) =>
                  setForm({ ...form, leaveType: e.target.value })
                }
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
              <label>Day Type</label>
              <select
                value={form.halfDay}
                onChange={(e) => setForm({ ...form, halfDay: e.target.value })}
                required
              >
                <option value="FULL">Full Day</option>
                <option value="FIRST_HALF">First Half</option>
                <option value="SECOND_HALF">Second Half</option>
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
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

            <div className="form-group full-width">
              <label>Reason</label>
              <textarea
                rows="3"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="days-chip">
            Calculated Days <span>{days}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button className="btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Leave"}
          </button>
        </div>
      </div>
    </div>
  );
}
