import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import { getLeavesForDate } from "../../services/sharePointService";
import { useUserContext } from "../../context/UserContext";
import DataTable from "../common/DataTable";
import "../common/tableHeader.css";

export default function TLMembersOnLeave() {
  const { instance, accounts } = useMsal();
  const { employeeHierarchy, userProfile } = useUserContext();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile || !accounts?.length) return;

    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      const leaves = await getLeavesForDate(token, date);

      const myEmail = userProfile.email.toLowerCase();

      // Filter only my team
      const teamLeaves = leaves.filter((l) => {
        const h = employeeHierarchy.find(
          (e) =>
            e.Employee?.EMail?.toLowerCase() ===
            l.Employee?.EMail?.toLowerCase()
        );

        if (!h) return false;

        return (
          h.TL?.EMail?.toLowerCase() === myEmail ||
          h.ATL?.EMail?.toLowerCase() === myEmail ||
          h.GTL?.EMail?.toLowerCase() === myEmail
        );
      });

      const mapped = teamLeaves.map((l) => ({
        Id: l.Id,
        Employee: l.Employee.Title,
        LeaveType: l.LeaveType.Title,
        Dates: l.StartDate.split("T")[0] + " → " + l.EndDate.split("T")[0],
        Status: l.Status,
      }));

      setRows(mapped);
    }

    load();
  }, [date, employeeHierarchy, userProfile, accounts]);

  const columns = [
    { key: "Employee", label: "Employee" },
    { key: "LeaveType", label: "Leave Type" },
    { key: "Dates", label: "Dates" },
    { key: "Status", label: "Status" },
  ];

  return (
    <>
      <div className="card">
        <div className="table-header">
          <h3>Members on Leave</h3>

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
    </>
  );
}
