import { CheckCircle, XCircle } from "lucide-react";

export default function TimesheetStatusTable({
  employees = [],
  timesheets = [],
}) {
  /* ============================
     1️⃣ Filter On-Project Employees
     ============================ */
  const activeEmployees = Array.isArray(employees)
    ? employees.filter((e) => e.Status === "On Project")
    : [];

  /* ============================
     2️⃣ Build Timesheet Lookup by Email (FIXED)
     ============================ */
  const timesheetStatusByEmail = {};

  if (Array.isArray(timesheets)) {
    timesheets.forEach((ts) => {
      const email =
        ts.Employee?.EMail || // ✅ FIX
        ts.EmployeeEMail || // fallback if exists
        ts.EmployeeEmail;

      if (email) {
        timesheetStatusByEmail[email.trim().toLowerCase()] = ts.Status?.trim();
      }
    });
  }

  /* ============================
     3️⃣ Cascading Status Logic
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
      <CheckCircle className="status-icon completed" />
    ) : (
      <XCircle className="status-icon pending" />
    );
  }

  /* ============================
     4️⃣ Render Table
     ============================ */
  return (
    <table className="timesheet-status-table">
      <thead>
        <tr>
          <th>Employee</th>
          <th>Submitted</th>
          <th>HR Approved</th>
          <th>Invoice Created</th>
        </tr>
      </thead>
      <tbody>
        {activeEmployees.map((emp) => {
          const email =
            emp.Employee?.EMail || // ✅ FIX
            emp.EMail ||
            emp.Email;

          const displayName = emp.Employee?.Title || emp.Title || "Unknown";

          const status =
            email && timesheetStatusByEmail[email.trim().toLowerCase()];

          const flags = resolveStatus(status);

          return (
            <tr key={email || displayName}>
              <td>{displayName}</td>
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
  );
}
