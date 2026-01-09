import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import { getLeavesForTLApproval } from "../../services/sharePointService";
import { useUserContext } from "../../context/UserContext";

import DataTable from "../common/DataTable";
import TLActionModal from "./TLActionModal";
import "../common/tableHeader.css";

export default function TLApprovalTable() {
  const { instance, accounts } = useMsal();
  const { employeeHierarchy, userProfile } = useUserContext();

  const [leaves, setLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    async function load() {
      try {
        setLoading(true);

        const token = await getAccessToken(instance, accounts[0]);
        const data = await getLeavesForTLApproval(token, userProfile.email);

        const myEmail = userProfile.email.toLowerCase();

        // ✅ Filter leaves where logged-in user is TL or ATL
        const myTeamLeaves = data.filter((leave) => {
          const hierarchy = employeeHierarchy.find(
            (h) =>
              h.Employee?.EMail?.toLowerCase() ===
              leave.Employee?.EMail?.toLowerCase()
          );

          if (!hierarchy) return false;

          return (
            hierarchy.TL?.EMail?.toLowerCase() === myEmail ||
            hierarchy.ATL?.EMail?.toLowerCase() === myEmail ||
            hierarchy.GTL?.EMail?.toLowerCase() === myEmail
          );
        });

        setLeaves(myTeamLeaves);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [employeeHierarchy, userProfile, instance, accounts]);

  if (loading) {
    return <p className="muted">Loading TL approvals...</p>;
  }

  /* ---------- TABLE CONFIG ---------- */

  const columns = [
    { key: "EmployeeName", label: "Employee" },
    { key: "Dates", label: "Dates" },
    { key: "NoofDays", label: "Days" },
    { key: "Reason", label: "Reason" },
    { key: "Status", label: "Status" },
  ];

  // ✅ Normalize SharePoint data for DataTable
  const tableData = leaves.map((l) => ({
    Id: l.Id,
    EmployeeName: l.Employee?.Title || "-",
    Dates: `${l.StartDate?.split("T")[0]} → ${l.EndDate?.split("T")[0]}`,
    NoofDays: l.NoofDays,
    Reason: l.Reason,
    Status: l.Status,
    _raw: l, // keep original SP record for modal actions
  }));

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        renderActions={(row) => (
          <button
            className="primary-btn"
            onClick={() => setSelectedLeave(row._raw)}
          >
            Review
          </button>
        )}
      />

      {selectedLeave && (
        <TLActionModal
          leave={selectedLeave}
          onClose={() => setSelectedLeave(null)}
          onSuccess={() => {
            setLeaves((prev) => prev.filter((l) => l.Id !== selectedLeave.Id));
            setSelectedLeave(null);
          }}
        />
      )}
    </>
  );
}
