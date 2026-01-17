import { useState } from "react";
import EditTimesheetModal from "./EditTimesheetModal";
import { deleteTimesheetRecord } from "../../services/sharePointService";

export default function TimesheetStatusTable({
  employees,
  timesheets,
  token,
  clients,
  reload,
}) {
  const [editing, setEditing] = useState(null);

  async function handleDelete(ts) {
    if (!window.confirm("Delete this timesheet?")) return;
    await deleteTimesheetRecord(token, ts.Id);
    reload();
  }

  return (
    <>
      <table className="data-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Submitted</th>
            <th>HR Approved</th>
            <th>Invoice Created</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const ts = timesheets.find((t) => t.Employee?.EMail === emp.EMail);

            return (
              <tr key={emp.Id}>
                <td>{emp.Title}</td>
                <td>{ts ? "✔" : "✖"}</td>
                <td>{ts?.Status === "HR Approved" ? "✔" : "✖"}</td>
                <td>✖</td>
                <td>
                  {ts && (
                    <span
                      className="action-icon edit"
                      onClick={() => setEditing(ts)}
                    >
                      ✏
                    </span>
                  )}
                </td>
                <td>
                  {ts && ts.Status !== "HR Approved" && (
                    <span
                      className="action-icon delete"
                      onClick={() => handleDelete(ts)}
                    >
                      🗑
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {editing && (
        <EditTimesheetModal
          token={token}
          timesheet={editing}
          clients={clients}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </>
  );
}
