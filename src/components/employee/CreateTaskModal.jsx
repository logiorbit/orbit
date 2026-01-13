import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import {
  getClients,
  getTaskTypes,
  createTask,
  getCurrentUser,
} from "../../services/sharePointService";

import "./managerDashboard.css"; // uses existing modal + grid styles

export default function CreateTaskModal({ onClose, onSuccess }) {
  const { instance, accounts } = useMsal();

  const [clients, setClients] = useState([]);
  const [types, setTypes] = useState([]);

  const [form, setForm] = useState({
    title: "",
    clientId: "",
    typeId: "",
    date: "",
    status: "Draft",
    estimated: "",
    productive: "",
    billable: "",
  });

  useEffect(() => {
    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      setClients(await getClients(token));
      setTypes(await getTaskTypes(token));
    }
    load();
  }, [instance, accounts]);

  async function submit() {
    if (
      !form.title ||
      !form.clientId ||
      !form.typeId ||
      !form.date ||
      !form.estimated
    ) {
      alert("Please fill all mandatory fields");
      return;
    }

    if (form.status === "Complete" && !form.billable) {
      alert("Billable Hours required when task is Complete");
      return;
    }

    const token = await getAccessToken(instance, accounts[0]);
    const user = await getCurrentUser(token);

    await createTask(token, {
      Title: form.title,
      TaskDate: form.date,
      Status: form.status,
      EstimatedHours: Number(form.estimated),
      ProductiveHours: form.productive ? Number(form.productive) : null,
      BillableHours: form.billable ? Number(form.billable) : null,
      ClientId: Number(form.clientId),
      TaskTypeId: Number(form.typeId),
      EmployeeId: user.Id,
    });

    onSuccess();
    onClose();
    window.location.reload();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card profile-modal">
        {/* HEADER */}
        <div className="modal-header">
          <h3>Create Task</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          <div className="profile-form-grid">
            {/* ROW 1 */}
            <div className="form-group">
              <label>Task Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            {/* ROW 2 */}
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
              <label>Task Type *</label>
              <select
                value={form.typeId}
                onChange={(e) => setForm({ ...form, typeId: e.target.value })}
                required
              >
                <option value="">Select Task Type</option>
                {types.map((t) => (
                  <option key={t.Id} value={t.Id}>
                    {t.Title}
                  </option>
                ))}
              </select>
            </div>

            {/* ROW 3 */}
            <div className="form-group">
              <label>Status *</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="WIP">WIP</option>
                <option value="Complete">Complete</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estimated Hours *</label>
              <input
                type="number"
                step="0.1"
                value={form.estimated}
                onChange={(e) =>
                  setForm({ ...form, estimated: e.target.value })
                }
                required
              />
            </div>

            {/* ROW 4 */}
            <div className="form-group">
              <label>Productive Hours</label>
              <input
                type="number"
                step="0.1"
                value={form.productive}
                onChange={(e) =>
                  setForm({ ...form, productive: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Billed Hours</label>
              <input
                type="number"
                step="0.1"
                value={form.billable}
                onChange={(e) => setForm({ ...form, billable: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
