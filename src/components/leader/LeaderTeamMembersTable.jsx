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
      CurrentClient: h.CurrentClient?.Title || "-",
      EndClient: h.EndClients,
      Mobile: h.Mobile,
    }));
    //
    setRows(mapped);
  }, [employeeHierarchy, userProfile]);

  const columns = [
    { key: "Name", label: "Employee Name" },
    { key: "Email", label: "Email" },
    { key: "Status", label: "Status" },
    { key: "Position", label: "Position" },
    { key: "TotalExp", label: "Total Exp" },
    { key: "RelevantExp", label: "Relevant Exp" },
    { key: "CurrentClient", label: "Current Client" },
    { key: "EndClient", label: "End Clients" },
    { key: "PersonalEmail", label: "PersonalEmail" },
    { key: "Mobile", label: "Mobile" },
  ];

  return <DataTable columns={columns} data={rows} />;
}
