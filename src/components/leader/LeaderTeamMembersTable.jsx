import { useEffect, useState } from "react";
import { useUserContext } from "../../context/UserContext";
import DataTable from "../common/DataTable";

export default function LeaderTeamMembersTable() {
  const { employeeHierarchy, userProfile } = useUserContext();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    const myEmail = userProfile.email.toLowerCase();

    // ✅ FILTER OUT BROKEN RECORDS FIRST
    const validHierarchy = employeeHierarchy.filter(
      (h) => h.Employee && h.Employee.Id && h.Employee.EMail && h.Employee.Title
    );

    const mapped = validHierarchy.map((h) => ({
      Id: h.Employee.Id,
      Name: h.Employee.Title,
      Email: h.Employee.EMail,
      Status: h.Status,
      Position: h.Position,
      TotalExp: h.TotalExp,
      RelevantExp: h.RelevantExp,
      PersonalEmail: h.PersonalEmail,
      CurrentClient: h.CurrentClient,
      EndClient: h.EndClients,
      Mobile: h.Mobile,
      Role: h.Manager?.EMail?.toLowerCase() === myEmail ? "Manager" : "",
    }));

    setRows(mapped);
  }, [employeeHierarchy, userProfile]);

  const columns = [
    { key: "Name", label: "Employee Name" },
    { key: "Email", label: "Email" },
    { key: "Status", label: "Status" },
    { key: "Position", label: "Position" },
    { key: "Total Exp", label: "Total Exp" },
    { key: "Relevant Exp", label: "Relevant Exp" },
    { key: "Current Client", label: "Current Client" },
    { key: "End Client", label: "End Clients" },
    { key: "Personal Email", label: "PersonalEmail" },
    { key: "Mobile", label: "Mobile" },
    { key: "Role", label: "Reporting As" },
  ];

  return <DataTable columns={columns} data={rows} />;
}
