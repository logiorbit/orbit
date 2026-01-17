import { CheckCircle, XCircle } from "lucide-react";

export default function TimesheetStatusTable({
  employees = [],
  timesheets = [],
  month,
  year,
}) {
  /* ============================
     Filter On-Project Employees
     ============================ */
  const activeEmployees = employees.filter((e) => e.Status === "On Project");

  /* ============================
     Build Timesheet Lookup (Email)
     ============================ */
  const timesheetStatusByEmail = {};

  timesheets.forEach((ts) => {
    const email = ts.Employee?.EMail || ts.EmployeeEMail || ts.EmployeeEmail;

    if (email) {
      timesheetStatusByEmail[email.toLowerCase()] = ts.Status?.trim();
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
    <div className="timesheet-card">
      {/* Header */}
      <div className="timesheet-card-header">
        <h4>
          Timesheet Status — {month} {year}
        </h4>
      </div>

      {/* Table */}
      <table className="timesheet-status-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Submitted</th>
            <th>HR Approved</th>
            <th>Invoice Created</th>
          </tr>
        </thead>
        <tbody>
          {activeEmployees.map((emp) => {
            const email = emp.Employee?.EMail || emp.EMail || emp.Email;

            const name = emp.Employee?.Title || emp.Title;

            const status = email && timesheetStatusByEmail[email.toLowerCase()];

            const flags = resolveStatus(status);

            return (
              <tr key={email}>
                <td className="employee-name">{name}</td>
                <td>
                  <StatusIcon done={flags.submitted} />
                </td>
                <td>
                  <StatusIcon done={flags.hrApproved} />
                </td>
                <td>
                  <StatusIcon done={flags.invoiceCreated} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
