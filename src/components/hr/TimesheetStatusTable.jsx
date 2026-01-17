import { CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";

export default function TimesheetStatusTable({
  employees = [],
  timesheets = [],
  month,
  year,
  onEdit, // optional callback
  onDelete, // optional callback
}) {
  /* ============================
     Filter On-Project Employees
     ============================ */
  const activeEmployees = employees.filter((e) => e.Status === "On Project");

  /* ============================
     Build Timesheet Lookup by Email
     ============================ */
  const timesheetByEmail = {};

  timesheets.forEach((ts) => {
    const email = ts.Employee?.EMail || ts.EmployeeEMail || ts.EmployeeEmail;

    if (email) {
      timesheetByEmail[email.toLowerCase()] = ts;
    }
  });

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

  return (
    <div className="table-card">
      {/* Header */}
      <div className="table-toolbar">
        <strong>
          Timesheet Status — {month} {year}
        </strong>
      </div>

      {/* Table */}
      <table className="data-table">
        <colgroup>
          <col style={{ width: "100%" }} />
        </colgroup>

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

            const timesheet = email && timesheetByEmail[email.toLowerCase()];

            const flags = resolveStatus(timesheet?.Status);

            const canModify = flags.submitted;
            const canDelete =
              flags.submitted &&
              (timesheet?.Status !== "HR Approved" ||
                timesheet?.Status !== "Invoice Created");

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

                {/* Edit */}
                <td className="actions">
                  <Pencil
                    size={16}
                    className={
                      canModify ? "action-icon edit" : "action-icon disabled"
                    }
                    onClick={() => canModify && onEdit(timesheet)}
                  />
                </td>

                {/* Delete */}
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
