import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import {
  getClients,
  submitTimesheet,
  uploadTimesheetAttachments,
} from "../../services/sharePointService";

export default function SubmitTimesheetModal({ onClose }) {
  const { instance, accounts } = useMsal();
  const [clients, setClients] = useState([]);

  /* =========================
     TIMESHEET STATE (CSV-ONLY)
     ========================= */
  const [form, setForm] = useState({
    title: "Timesheet",
    client: "",
    month: "",
    year: new Date().getFullYear(),
    totalWorkingDays: "",
    totalLeaves: "",
    totalHolidays: "",
    leaveDates: "",
    holidayDates: "",
    totalBillingDays: "",
    totalBillingHours: "",
    status: "Not Submitted", // EXACT Choice
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      setClients(await getClients(token));
    }
    load();
  }, [instance, accounts]);

  /* =========================
     SUBMIT
     ========================= */
  const submit = async () => {
    if (!form.clientId || !form.month || !form.year) {
      alert("Client, Month and Year are mandatory.");
      return;
    }

    setLoading(true);

    try {
      const token = await getAccessToken(instance, accounts[0]);

      const itemId = await submitTimesheet(token, {
        ...form,
        cliendId: Number(form.clientId),
        year: String(form.year),
        totalWorkingDays: Number(form.totalWorkingDays),
        totalLeaves: Number(form.totalLeaves),
        totalHolidays: Number(form.totalHolidays),
        totalBillingDays: Number(form.totalBillingDays),
        totalBillingHours: Number(form.totalBillingHours),
      });

      if (files.length > 0) {
        await uploadTimesheetAttachments(token, itemId, files);
      }

      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to save timesheet");
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
                <option key={c.Id} value={c.Id}>
                  {c.Title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Month</label>
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
            <label>Year</label>
            <input
              type="number"
              placeholder="Year"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Total Working Days</label>
            <input
              type="number"
              placeholder="Total Working Days"
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
              placeholder="Total Leaves"
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
              placeholder="Total Holidays"
              value={form.totalHolidays}
              onChange={(e) =>
                setForm({ ...form, totalHolidays: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Leave Dates</label>
            <textarea
              placeholder="Leave Dates"
              value={form.leaveDates}
              onChange={(e) => setForm({ ...form, leaveDates: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Holiday Date</label>
            <textarea
              placeholder="Holiday Dates"
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
              placeholder="Total Billing Days"
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
              placeholder="Total Billing Hours"
              value={form.totalBillingHours}
              onChange={(e) =>
                setForm({ ...form, totalBillingHours: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            {" "}
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
