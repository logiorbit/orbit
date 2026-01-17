import { CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";
import "./HRDashboard.css";

export default function TimesheetStatusTable({
  employees = [],
  timesheets = [],
  onEdit,
  onDelete,
}) {
  /* ============================
     Filter On-Project Employees
     ============================ */
  const activeEmployees = employees.filter((e) => e.Status === "On Project");

  /* ============================
     Build FULL timesheet lookup
     (IMPORTANT FIX)
     ============================ */
  const timesheetByEmail = {};

  timesheets.forEach((ts) => {
    const email = ts.Employee?.EMail || ts.EmployeeEMail || ts.EmployeeEmail;

    if (email) {
      // ✅ STORE FULL SHAREPOINT ITEM
      timesheetByEmail[email.toLowerCase()] = ts;
    }
  });

  /* ============================
     Status cascade logic
     ============================ */
  function resolveStatus(status) {
    return {
      submitted:
        status === "Submitted" ||
        status === "HR Approved" ||
        status === "Invoice Created",

      hrApproved: status === "HR Approved" || status === "Invoice Created",

      invoiceCreated: status === "Invoice Created",
    };
  }

  function StatusIcon({ done }) {
    return done ? (
      <CheckCircle className="status-icon done" />
    ) : (
      <XCircle className="status-icon not-done" />
    );
  }

  /* ============================
     Render
     ============================ */
  return (
    <div className="timesheet-table-wrapper">
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
          {activeEmployees.map((emp) => {
            const email = emp.Employee?.EMail || emp.EMail || emp.Email;

            const name = emp.Employee?.Title || emp.Title || "Unknown";

            // ✅ THIS IS NOW THE FULL ITEM
            const timesheet = email && timesheetByEmail[email.toLowerCase()];

            const flags = resolveStatus(timesheet?.Status);

            const canEdit = flags.submitted;
            const canDelete =
              flags.submitted && timesheet?.Status !== "HR Approved";

            return (
              <tr key={email || name}>
                <td>{name}</td>

                <td>
                  <StatusIcon done={flags.submitted} />
                </td>

                <td>
                  <StatusIcon done={flags.hrApproved} />
                </td>

                <td>
                  <StatusIcon done={flags.invoiceCreated} />
                </td>

                <td className="actions">
                  <Pencil
                    size={16}
                    className={
                      canEdit ? "action-icon edit" : "action-icon disabled"
                    }
                    onClick={() => canEdit && onEdit(timesheet)}
                  />
                </td>

                <td className="actions">
                  <Trash2
                    size={16}
                    className={
                      canDelete ? "action-icon delete" : "action-icon disabled"
                    }
                    onClick={() => canDelete && onDelete(timesheet)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
