import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import { useUserContext } from "../../context/UserContext";
import { getManagerTeamMembers } from "../../services/sharePointService";
import DataTable from "../common/DataTable";

export default function ManagerTeamMembersTable() {
  const { employeeHierarchy, userProfile } = useUserContext();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    const myEmail = userProfile.email.toLowerCase();

    // Filter employees where logged-in user is Manager
    const team = employeeHierarchy.filter(
      (h) => h.Manager?.EMail?.toLowerCase() === myEmail
    );

    const mapped = team.map((h) => ({
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
