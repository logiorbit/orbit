import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import {
  getClients,
  getTaskTypes,
  createTask,
  getCurrentUser,
} from "../../services/sharePointService";

export default function CreateTaskModal({ onClose, onSuccess }) {
  const { instance, accounts } = useMsal();

  const [clients, setClients] = useState([]);
  const [types, setTypes] = useState([]);

  const [form, setForm] = useState({
    title: "",
    clientId: "",
    typeId: "",
    date: new Date().toISOString().split("T")[0],
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
  }, []);

  async function submit() {
    if (!form.title || !form.clientId || !form.typeId || !form.estimated) {
      alert("Please fill all required fields");
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
      BillableHours: form.billable ? Number(form.billable) : null,
      ProductiveHours: form.productive ? Number(form.productive) : null,
      ClientId: Number(form.clientId),
      TaskTypeId: Number(form.typeId),
      EmployeeId: user.Id,
    });

    onSuccess();
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Create Task</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <label>Task Title</label>
        <input
          placeholder="Task Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <label>Select Client</label>
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

        <label>Select Task Type</label>
        <select
          value={form.typeId}
          onChange={(e) => setForm({ ...form, typeId: e.target.value })}
        >
          <option value="">Select Task Type</option>
          {types.map((t) => (
            <option key={t.Id} value={t.Id}>
              {t.Title}
            </option>
          ))}
        </select>

        <label>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option>Draft</option>
          <option>Work In Progress</option>
          <option>Complete</option>
        </select>

        <label>Estimated Hours</label>
        <input
          type="number"
          step="0.1"
          placeholder="Estimated Hours"
          value={form.estimated}
          onChange={(e) => setForm({ ...form, estimated: e.target.value })}
        />

        <label>Productive Hours</label>
        <input
          type="number"
          step="0.1"
          placeholder="Productive Hours"
          value={form.productive}
          onChange={(e) => setForm({ ...form, productive: e.target.value })}
        />

        <label>Billed Hours</label>
        <input
          type="number"
          step="0.1"
          placeholder="Billable Hours"
          value={form.billable}
          onChange={(e) => setForm({ ...form, billable: e.target.value })}
        />

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
