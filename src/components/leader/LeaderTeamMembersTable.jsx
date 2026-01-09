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
      Role: h.Manager?.EMail?.toLowerCase() === myEmail ? "Manager" : "",
    }));

    setRows(mapped);
  }, [employeeHierarchy, userProfile]);

  const columns = [
    { key: "Name", label: "Employee Name" },
    { key: "Email", label: "Email" },
    { key: "Role", label: "Reporting As" },
  ];

  return <DataTable columns={columns} data={rows} />;
}
