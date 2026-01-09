import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import {
  getTasksByClientAndDate,
  getAllTeamMembers,
  getClients,
} from "../../services/sharePointService";
import { useUserContext } from "../../context/UserContext";
import DataTable from "../common/DataTable";
import "../common/tableHeader.css";

export default function LeaderTasksByClientDate() {
  const { instance, accounts } = useMsal();
  const { employeeHierarchy, userProfile } = useUserContext();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [client, setClient] = useState("");
  const [clients, setClients] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function init() {
      const token = await getAccessToken(instance, accounts[0]);
      setClients(await getClients(token));
    }
    init();
  }, []);

  useEffect(() => {
    if (!client || !employeeHierarchy || !userProfile) return;

    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      const team = getAllTeamMembers(employeeHierarchy, userProfile.email);

      const tasks = await getTasksByClientAndDate(token, client, date, team);

      setRows(
        tasks.map((t) => ({
          Id: t.Id,
          Employee: t.Employee.Title,
          Hours: t.EstimatedHours,
        }))
      );
    }

    load();
  }, [client, date, employeeHierarchy, userProfile]);

  const columns = [
    { key: "Employee", label: "Employee" },
    { key: "Hours", label: "Estimated Hours" },
  ];

  return (
    <div className="card">
      <div className="table-header">
        <h3>Tasks by Client & Date</h3>

        <div className="table-filters">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <select onChange={(e) => setClient(e.target.value)}>
            <option value="">Select Client</option>
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
  );
}
