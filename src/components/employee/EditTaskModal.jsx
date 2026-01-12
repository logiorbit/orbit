import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import {
  getClients,
  getTaskTypes,
  updateTask,
} from "../../services/sharePointService";

export default function EditTaskModal({ task, onClose, onSuccess }) {
  const { instance, accounts } = useMsal();

  const [clients, setClients] = useState([]);
  const [types, setTypes] = useState([]);

  const [form, setForm] = useState({
    title: "",
    clientId: "",
    typeId: "",
    date: "",
    status: "",
    estimated: "",
    productive: "",
    billable: "",
  });

  // 🔑 Load dropdown data
  useEffect(() => {
    async function loadLists() {
      const token = await getAccessToken(instance, accounts[0]);
      setClients(await getClients(token));
      setTypes(await getTaskTypes(token));
    }
    loadLists();
  }, []);

  // 🔑 Pre-fill form when task arrives
  useEffect(() => {
    if (!task) return;

    setForm({
      title: task.Title || "",
      clientId: task.Client?.Id || "",
      typeId: task.TaskType?.Id || "",
      date: task.TaskDate?.split("T")[0],
      status: task.Status,
      estimated: task.EstimatedHours,
      billable: task.BillableHours ?? "",
      productive: task.ProductiveHours ?? "",
    });
  }, [task]);

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

    await updateTask(token, task.Id, {
      Title: form.title,
      TaskDate: form.date,
      Status: form.status,
      EstimatedHours: Number(form.estimated),
      BillableHours: form.billable ? Number(form.billable) : null,
      ProductiveHours: form.productive ? Number(form.productive) : null,
      ClientId: Number(form.clientId),
      TaskTypeId: Number(form.typeId),
    });

    onSuccess();
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Edit Task</h3>
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

        <label>Task Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
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
          <option>WIP</option>
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

        <label>Billable Hours</label>
        <input
          type="number"
          step="0.1"
          placeholder="Billable Hours"
          value={form.billable}
          onChange={(e) => setForm({ ...form, billable: e.target.value })}
        />

        <div className="modal-actions">
          <button className="primary-btn" onClick={submit}>
            Update Task
          </button>
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
