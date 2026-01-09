import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import {
  getLeavesForDate,
  getManagerTeamMembers,
} from "../../services/sharePointService";
import { useUserContext } from "../../context/UserContext";
import DataTable from "../common/DataTable";
import "../common/tableHeader.css";

export default function ManagerMembersOnLeave() {
  const { instance, accounts } = useMsal();
  const { employeeHierarchy, userProfile } = useUserContext();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      const leaves = await getLeavesForDate(token, date);

      const teamEmails = getManagerTeamMembers(
        employeeHierarchy,
        userProfile.email
      ).map((m) => m.EMail?.toLowerCase());

      const filtered = leaves.filter((l) =>
        teamEmails.includes(l.Employee?.EMail?.toLowerCase())
      );

      setRows(filtered);
    }

    load();
  }, [date, employeeHierarchy, userProfile]);

  const columns = [
    { key: "Employee", label: "Employee" },
    { key: "LeaveType", label: "Leave Type" },
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

        <DataTable
          columns={columns}
          data={rows.map((l) => ({
            Id: l.Id,
            Employee: l.Employee?.Title,
            LeaveType: l.LeaveType?.Title,
            Status: l.Status,
          }))}
        />
      </div>
    </>
  );
}
