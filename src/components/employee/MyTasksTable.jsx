import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import {
  getMyTasksForDate,
  getCurrentUser,
  deleteTask,
} from "../../services/sharePointService";
import DataTable from "../common/DataTable";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";

export default function MyTasksTable() {
  const { instance, accounts } = useMsal();

  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [editTask, setEditTask] = useState(null);

  async function loadTasks() {
    const token = await getAccessToken(instance, accounts[0]);
    const user = await getCurrentUser(token);
    const data = await getMyTasksForDate(token, user.Id, date);
    setTasks(data || []);
  }

  useEffect(() => {
    if (accounts?.length) loadTasks();
  }, [date, accounts]);

  async function handleDelete(taskId) {
    if (!window.confirm("Delete this task?")) return;

    const token = await getAccessToken(instance, accounts[0]);
    await deleteTask(token, taskId);
    loadTasks();
  }

  const columns = [
    { key: "TaskType", label: "Task Type" },
    { key: "Client", label: "Client" },
    { key: "EstimatedHours", label: "Estimated" },
    { key: "ProductiveHours", label: "Productive" },
    { key: "BillableHours", label: "Billable" },
    { key: "Status", label: "Status" },
  ];

  const mappedTasks = tasks.map((t) => ({
    Id: t.Id,
    TaskType: t.TaskType?.Title || "-",
    Client: t.Client?.Title || "-",
    EstimatedHours: t.EstimatedHours ?? 0,
    BillableHours: t.BillableHours ?? 0,
    ProductiveHours: t.ProductiveHours ?? 0,
    Status: t.Status,
    raw: t, // IMPORTANT for edit
  }));

  return (
    <>
      <div className="table-card" style={{ marginTop: 24 }}>
        <div className="table-header">
          <div className="form-group">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={mappedTasks}
          renderActions={(row) => (
            <>
              <button className="icon-btn" onClick={() => setEditTask(row.raw)}>
                ✏️
              </button>
              <button
                className="icon-btn danger"
                onClick={() => handleDelete(row.Id)}
              >
                🗑
              </button>
            </>
          )}
        />
      </div>

      {editTask && (
        <EditTaskModal
          task={editTask}
          mode="edit"
          onClose={() => setEditTask(null)}
          onSuccess={() => {
            setEditTask(null);
            loadTasks();
          }}
        />
      )}
    </>
  );
}
