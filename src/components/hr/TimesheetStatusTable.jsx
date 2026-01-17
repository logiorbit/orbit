import { CheckCircle, XCircle } from "lucide-react";
//import "./HRDashboard.jsx";

export default function TimesheetStatusTable({ employees, timesheets }) {
  /* ============================
     Filter Active Employees
     ============================ */
  const activeEmployees = employees.filter((e) => e.Status === "On Project");

  /* ============================
     Map Timesheets by Employee
     ============================ */
  const timesheetMap = {};
  timesheets.forEach((ts) => {
    timesheetMap[ts.EmployeeId] = ts.Status;
  });

  /* ============================
     Cascading Status Logic
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

  return (
    <div className="timesheet-table-card">
      <table className="status-table">
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
            const status = timesheetMap[emp.EmployeeId];
            const flags = resolveStatus(status);

            return (
              <tr key={emp.EmployeeId}>
                <td>{emp.EmployeeName}</td>
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
