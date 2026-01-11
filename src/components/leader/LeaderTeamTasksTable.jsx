import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import { getTasksForDate2 } from "../../services/sharePointService";
import { useUserContext } from "../../context/UserContext";
import DataTable from "../common/DataTable";
import "../common/tableHeader.css";

export default function LeaderTeamTasksTable() {
  const { instance, accounts } = useMsal();
  const { employeeHierarchy } = useUserContext();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [employeeEmail, setEmployeeEmail] = useState("ALL");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!employeeHierarchy || !accounts?.length) return;

    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      const tasks = await getTasksForDate2(token, date);

      let filtered = tasks;

      if (employeeEmail !== "ALL") {
        filtered = tasks.filter(
          (t) => t.Employee?.EMail?.toLowerCase() === employeeEmail
        );
      }

      const mapped = filtered.map((t) => ({
        Id: t.Id,
        Employee: t.Employee?.Title,
        Client: t.Client?.Title,
        TaskType: t.TaskType?.Title,
        EstimatedHours: t.EstimatedHours || 0,
        BillableHours: t.BillableHours || 0,
        Status: t.Status,
      }));

      setRows(mapped);
    }

    load();
  }, [date, employeeEmail, employeeHierarchy, accounts]);

  // 🔹 Leadership sees ALL employees
  const allEmployees = employeeHierarchy
    .map((h) => h.Employee)
    .filter(Boolean)
    .reduce((acc, emp) => {
      if (!acc.find((e) => e.EMail === emp.EMail)) acc.push(emp);
      return acc;
    }, []);

  const columns = [
    { key: "Employee", label: "Employee" },
    { key: "Client", label: "Client" },
    { key: "TaskType", label: "Task Type" },
    { key: "EstimatedHours", label: "Allocated (hrs)" },
    { key: "BillableHours", label: "Billable (hrs)" },
    { key: "Status", label: "Status" },
  ];

  return (
    <div className="card">
      <div className="table-header">
        <h3>All Teams Tasks</h3>

        <div className="table-filters">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <select
            value={employeeEmail}
            onChange={(e) => setEmployeeEmail(e.target.value)}
          >
            <option value="ALL">All Employees</option>
            {allEmployees.map((e) => (
              <option key={e.EMail} value={e.EMail.toLowerCase()}>
                {e.Title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={rows} />
    </div>
  );
}
