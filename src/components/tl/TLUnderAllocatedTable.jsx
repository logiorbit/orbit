import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import { useUserContext } from "../../context/UserContext";
import { getTasksForDate } from "../../services/sharePointService";
import DataTable from "../common/DataTable";
import "../common/tableHeader.css";

export default function TLUnderAllocatedTable() {
  const { instance, accounts } = useMsal();
  const { employeeHierarchy, userProfile } = useUserContext();

  const [rows, setRows] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile || !accounts?.length) return;

    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      const tasks = await getTasksForDate(token, date);

      const myEmail = userProfile.email.toLowerCase();

      // 1️⃣ Get team members
      const teamMembers = employeeHierarchy.filter(
        (h) =>
          h.TL?.EMail?.toLowerCase() === myEmail ||
          h.ATL?.EMail?.toLowerCase() === myEmail ||
          h.GTL?.EMail?.toLowerCase() === myEmail
      );

      // 2️⃣ Build under-allocation rows
      const underAllocated = teamMembers
        .map((member) => {
          const empEmail = member.Employee?.EMail?.toLowerCase();
          const empName = member.Employee?.Title;

          const empTasks = tasks.filter(
            (t) => t.Employee?.EMail?.toLowerCase() === empEmail
          );

          const estimated = empTasks.reduce(
            (sum, t) => sum + (t.EstimatedHours || 0),
            0
          );

          if (estimated >= 9) return null;

          return {
            Id: empEmail,
            Employee: empName,
            Estimated: estimated,
            Capacity: 9,
            Remaining: 9 - estimated,
          };
        })
        .filter(Boolean); // remove nulls

      setRows(underAllocated);
    }

    load();
  }, [employeeHierarchy, userProfile, accounts, date]);

  const columns = [
    { key: "Employee", label: "Employee" },
    { key: "Estimated", label: "Estimated (hrs)" },
    { key: "Capacity", label: "Capacity (hrs)" },
    { key: "Remaining", label: "Remaining (hrs)" },
  ];

  return (
    <div className="card">
      <div className="table-header">
        <h3>Under-allocated Team Members</h3>

        <div className="table-filters">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={rows} />
    </div>
  );
}
