import { CheckCircle, XCircle } from "lucide-react";
import MonthYearFilter from "./MonthYearFilter";

export default function TimesheetStatusTable({
  employees,
  timesheets,
  month,
  year,
  onMonthChange,
  onYearChange,
}) {
  const onProjectEmployees = employees.filter((e) => e.Status === "On Project");

  const hasSubmittedTimesheet = (employeeEmail) =>
    timesheets.some(
      (t) =>
        t.Employee?.EMail?.toLowerCase() === employeeEmail.toLowerCase() &&
        t.Status !== "Draft"
    );

  return (
    <div className="hr-card">
      <div className="hr-card-header">
        <h3 className="hr-card-title">
          Timesheet Submission Status – {month} {year}
        </h3>

        {/* Month / Year dropdowns stay as discussed earlier */}
      </div>

      <table className="hr-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Timesheet</th>
          </tr>
        </thead>
        <tbody>
          {onProjectEmployees.map((e) => (
            <tr key={e.Id}>
              <td>{e.Employee?.Title}</td>
              <td className="status-icon">
                {hasSubmittedTimesheet(e.Employee?.EMail) ? (
                  <span className="icon-success">✔</span>
                ) : (
                  <span className="icon-failure">✖</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
