import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";

import {
  getClients,
  submitTimesheet,
  uploadTimesheetAttachments,
  getEmployeeHierarchyByEmail,
} from "../../services/sharePointService";

export default function SubmitTimesheetModal({ onClose }) {
  const { instance, accounts } = useMsal();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  /* =========================
     TIMESHEET STATE
     ========================= */
  const [form, setForm] = useState({
    title: "Timesheet",
    clientId: "",
    month: "",
    year: new Date().getFullYear(),
    totalWorkingDays: "",
    totalLeaves: "",
    totalHolidays: "",
    leaveDates: "",
    holidayDates: "",
    totalBillingDays: "",
    totalBillingHours: "",
    status: "Submitted",
  });

  /* =========================
     LOAD CLIENTS
     ========================= */
  useEffect(() => {
    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      const data = await getClients(token);
      setClients(Array.isArray(data) ? data : []);
    }
    load();
  }, [instance, accounts]);

  /* =========================
     SUBMIT HANDLER
     ========================= */
  const submit = async () => {
    if (!form.clientId || !form.month || !form.year) {
      alert("Client, Month and Year are mandatory.");
      return;
    }

    setLoading(true);

    try {
      const token = await getAccessToken(instance, accounts[0]);

      /* =========================
         Resolve Logged-in Employee
         ========================= */
      const userEmail = accounts[0]?.username;

      if (!userEmail) {
        throw new Error("Unable to determine logged-in user email");
      }

      const employeeHierarchy = await getEmployeeHierarchyByEmail(
        token,
        userEmail,
      );

      if (!employeeHierarchy) {
        throw new Error(
          `Employee not found in Employee_Hierarchy for ${userEmail}`,
        );
      }

      /* =========================
         Build Timesheet Payload
         ========================= */
      const payload = {
        Title: form.title,
        Month: form.month,
        Year: String(form.year),
        Status: "Submitted",

        ClientId: Number(form.clientId), // Lookup
        EmployeeHierarchyId: employeeHierarchy.ID, // 🔑 FIX

        TotalWorkingDays: Number(form.totalWorkingDays) || 0,
        TotalLeaves: Number(form.totalLeaves) || 0,
        TotalHolidays: Number(form.totalHolidays) || 0,
        LeaveDates: form.leaveDates || "",
        HolidayDates: form.holidayDates || "",
        TotalBillingDays: Number(form.totalBillingDays) || 0,
        TotalBillingHours: Number(form.totalBillingHours) || 0,
      };

      /* =========================
         Create Timesheet
         ========================= */
      const itemId = await submitTimesheet(token, payload);

      /* =========================
         Upload Attachments
         ========================= */
      if (files.length > 0) {
        await uploadTimesheetAttachments(token, itemId, files);
      }

      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Failed to save timesheet:", err);
      alert(err.message || "Failed to save timesheet");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Create Timesheet</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Client *</label>
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              required
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.ID} value={c.ID}>
                  {c.Title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Month *</label>
            <select
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
            >
              <option value="">Select Month</option>
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
            <label>Year *</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Total Working Days</label>
            <input
              type="number"
              value={form.totalWorkingDays}
              onChange={(e) =>
                setForm({ ...form, totalWorkingDays: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Total Leaves</label>
            <input
              type="number"
              value={form.totalLeaves}
              onChange={(e) =>
                setForm({ ...form, totalLeaves: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Total Holidays</label>
            <input
              type="number"
              value={form.totalHolidays}
              onChange={(e) =>
                setForm({ ...form, totalHolidays: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Leave Dates</label>
            <textarea
              value={form.leaveDates}
              onChange={(e) => setForm({ ...form, leaveDates: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Holiday Dates</label>
            <textarea
              value={form.holidayDates}
              onChange={(e) =>
                setForm({ ...form, holidayDates: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Total Billing Days</label>
            <input
              type="number"
              value={form.totalBillingDays}
              onChange={(e) =>
                setForm({ ...form, totalBillingDays: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Total Billing Hours</label>
            <input
              type="number"
              value={form.totalBillingHours}
              onChange={(e) =>
                setForm({ ...form, totalBillingHours: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Attachments</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles([...e.target.files])}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button onClick={submit} disabled={loading}>
            {loading ? "Saving..." : "Submit Timesheet"}
          </button>
        </div>
      </div>
    </div>
  );
}
