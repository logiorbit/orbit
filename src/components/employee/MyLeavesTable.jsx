import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import DataTable from "../common/DataTable";
import EditLeaveModal from "./EditLeaveModal";
import { deleteLeave } from "../../services/sharePointService";

export default function MyLeavesTable({ leaves = [], onRefresh }) {
  const { instance, accounts } = useMsal();
  const [editLeave, setEditLeave] = useState(null);

  const columns = [
    { key: "LeaveTypeText", label: "Type" },
    { key: "StartDateText", label: "From" },
    { key: "EndDateText", label: "To" },
    { key: "NoofDays", label: "Days" },
    { key: "Status", label: "Status" },
  ];

  // ✅ EXACT SAME PATTERN AS MY TASKS
  const rows = leaves.map((l) => ({
    ...l,
    Id: l.Id,
    LeaveTypeText: l.LeaveType?.Title || "",
    StartDateText: l.StartDate?.split("T")[0],
    EndDateText: l.EndDate?.split("T")[0],
  }));

  async function handleDelete(leave) {
    // console.log(leave);
    const start = new Date(leave.StartDate);
    const today = new Date();

    if (start <= today) {
      alert("Past or current leaves cannot be deleted");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this leave?")) return;

    const token = await getAccessToken(instance, accounts[0]);
    await deleteLeave(token, leave.Id);
    onRefresh();
  }

  function canEdit(leave) {
    return ["Pending", "TL Approved"].includes(leave.Status);
  }

  function canDelete(leave) {
    const start = new Date(leave.StartDate);
    return (
      ["Pending", "Rejected", "TL Approved"].includes(leave.Status) &&
      start > new Date()
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        renderActions={(row) => {
          if (!row) return null;

          return (
            <>
              {canEdit(row) && (
                <button
                  className="icon-btn"
                  title="Edit"
                  onClick={() => setEditLeave(row)}
                >
                  ✏️
                </button>
              )}
              {canDelete(row) && (
                <button
                  className="icon-btn danger"
                  title="Delete"
                  onClick={() => handleDelete(row)}
                >
                  🗑
                </button>
              )}
            </>
          );
        }}
      />

      {editLeave && (
        <EditLeaveModal
          leave={editLeave}
          onClose={() => setEditLeave(null)}
          onSuccess={() => {
            setEditLeave(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
