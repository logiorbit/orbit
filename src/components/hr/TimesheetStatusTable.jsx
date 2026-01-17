import { CheckCircle, XCircle } from "lucide-react";
import "../common/table.css";

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
     Build Timesheet Lookup by Email
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
    <div className="table-card">
      {/* Toolbar / Header */}
      <div className="table-toolbar">
        <strong>
          Timesheet Status — {month} {year}
        </strong>
      </div>

      {/* Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: "40%" }}>Employee Name</th>
            <th style={{ width: "20%" }}>Submitted</th>
            <th style={{ width: "20%" }}>HR Approved</th>
            <th style={{ width: "20%" }}>Invoice Created</th>
          </tr>
        </thead>

        <tbody>
          {activeEmployees.map((emp) => {
            const email = emp.Employee?.EMail || emp.EMail || emp.Email;

            const name = emp.Employee?.Title || emp.Title || "Unknown";

            const status = email && timesheetStatusByEmail[email.toLowerCase()];

            const flags = resolveStatus(status);

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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
