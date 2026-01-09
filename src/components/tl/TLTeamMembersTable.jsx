import { useEffect, useState } from "react";
import { useUserContext } from "../../context/UserContext";
import DataTable from "../common/DataTable";
import "../common/tableHeader.css";

export default function TLTeamMembersTable() {
  const { employeeHierarchy, userProfile } = useUserContext();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    const myEmail = userProfile.email.toLowerCase();

    // Filter employees where logged-in user is TL or ATL
    const team = employeeHierarchy.filter(
      (h) =>
        h.TL?.EMail?.toLowerCase() === myEmail ||
        h.ATL?.EMail?.toLowerCase() === myEmail ||
        h.GTL?.EMail?.toLowerCase() === myEmail
    );

    const mapped = team.map((h) => ({
      Id: h.Employee.Id,
      Name: h.Employee.Title,
      Email: h.Employee.EMail,
      Role:
        h.TL?.EMail?.toLowerCase() === myEmail
          ? "TL"
          : h.ATL?.EMail?.toLowerCase() === myEmail
          ? "ATL"
          : h.GTL?.EMail?.toLowerCase() === myEmail
          ? "GTL"
          : "",
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
