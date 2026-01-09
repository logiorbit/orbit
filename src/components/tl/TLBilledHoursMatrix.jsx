import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import { getTasksForMonth } from "../../services/sharePointService";
import { useUserContext } from "../../context/UserContext";
import DataTable from "../common/DataTable";
import "../common/tableHeader.css";

export default function TLBilledHoursMatrix() {
  const { instance, accounts } = useMsal();
  const { employeeHierarchy, userProfile } = useUserContext();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile || !accounts?.length) return;

    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      const tasks = await getTasksForMonth(token, month, year);

      const myEmail = userProfile.email.toLowerCase();

      const teamMembers = employeeHierarchy.filter(
        (h) =>
          h.TL?.EMail?.toLowerCase() === myEmail ||
          h.ATL?.EMail?.toLowerCase() === myEmail ||
          h.GTL?.EMail?.toLowerCase() === myEmail
      );

      const daysInMonth = new Date(year, month, 0).getDate();

      const matrix = teamMembers.map((m) => {
        const empEmail = m.Employee?.EMail?.toLowerCase();
        const empName = m.Employee?.Title;

        const row = {
          Id: empEmail,
          Employee: empName,
        };

        let total = 0;

        for (let d = 1; d <= daysInMonth; d++) {
          const dayTasks = tasks.filter((t) => {
            const tDate = new Date(t.TaskDate);
            return (
              t.Employee?.EMail?.toLowerCase() === empEmail &&
              tDate.getDate() === d &&
              tDate.getMonth() + 1 === month &&
              tDate.getFullYear() === year
            );
          });

          const billed = dayTasks.reduce(
            (sum, t) => sum + (t.BillableHours || 0),
            0
          );

          if (billed > 0) {
            row[`D${d}`] = billed;
            total += billed;
          }
        }

        row.Total = total;
        return row;
      });

      setRows(matrix);
    }

    load();
  }, [month, year, employeeHierarchy, userProfile, accounts]);

  const daysInMonth = new Date(year, month, 0).getDate();

  const columns = [
    { key: "Employee", label: "Employee" },
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      key: `D${i + 1}`,
      label: `${i + 1}`,
    })),
    { key: "Total", label: "Total" },
  ];

  return (
    <>
      <div className="table-header">
        <h3>Billed Hours Summary</h3>

        <div className="table-filters">
          <select value={month} onChange={(e) => setMonth(+e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <select value={year} onChange={(e) => setYear(+e.target.value)}>
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={today.getFullYear() - i}>
                {today.getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={rows} />
    </>
  );
}
