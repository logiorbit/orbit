import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import { getTasksForDate, getClients } from "../../services/sharePointService";
import { useUserContext } from "../../context/UserContext";
import DataTable from "../common/DataTable";
import "../common/tableHeader.css";

export default function TLTasksByClientDate() {
  const { instance, accounts } = useMsal();
  const { employeeHierarchy, userProfile } = useUserContext();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!accounts?.length) return;

    async function loadClients() {
      const token = await getAccessToken(instance, accounts[0]);
      const data = await getClients(token);
      setClients(data);
    }

    loadClients();
  }, [accounts]);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile || !accounts?.length) return;

    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      const tasks = await getTasksForDate(token, date);

      const myEmail = userProfile.email.toLowerCase();

      const myTeam = employeeHierarchy.filter(
        (h) =>
          h.TL?.EMail?.toLowerCase() === myEmail ||
          h.ATL?.EMail?.toLowerCase() === myEmail ||
          h.GTL?.EMail?.toLowerCase() === myEmail
      );

      const filtered = tasks.filter((t) => {
        const empEmail = t.Employee?.EMail?.toLowerCase();
        const isMyMember = myTeam.some(
          (m) => m.Employee?.EMail?.toLowerCase() === empEmail
        );

        if (!isMyMember) return false;

        if (clientId && t.Client?.Id !== Number(clientId)) return false;

        return true;
      });

      const mapped = filtered.map((t) => ({
        Id: t.Id,
        Employee: t.Employee?.Title,
        TaskType: t.TaskType?.Title,
        Client: t.Client?.Title,
        Estimated: t.EstimatedHours || 0,
        Billable: t.BillableHours || 0,
        Status: t.Status,
      }));

      setRows(mapped);
    }

    load();
  }, [date, clientId, employeeHierarchy, userProfile, accounts]);

  const columns = [
    { key: "Employee", label: "Employee" },
    { key: "TaskType", label: "Task Type" },
    { key: "Client", label: "Client" },
    { key: "Estimated", label: "Allocated (hrs)" },
    { key: "Billable", label: "Billable (hrs)" },
    { key: "Status", label: "Status" },
  ];

  return (
    <>
      <div className="card">
        <div className="table-header">
          <h3>Tasks by Client & Date</h3>

          <div className="table-filters">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c.Id} value={c.Id}>
                  {c.Title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={rows} />
      </div>
    </>
  );
}
