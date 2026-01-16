import { CheckCircle, XCircle } from "lucide-react";
import MonthYearFilter from "./MonthYearFilter";

export default function TimesheetStatusTable({
  employees,
  timesheets,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) {
  const onProjectEmployees = employees.filter((e) => e.status === "On Project");

  const isSubmitted = (email) => {
    const record = timesheets.find(
      (t) =>
        t.employeeEmail === email &&
        t.month === selectedMonth &&
        Number(t.year) === Number(selectedYear)
    );

    return record?.submissionStatus === "Submitted";
  };

  return (
    <div className="hr-card">
      <div className="hr-card-header">
        <h3 className="hr-card-title">Timesheet Submission Status</h3>

        <MonthYearFilter
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
        />
      </div>

      <table className="hr-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {onProjectEmployees.map((emp) => (
            <tr key={emp.email}>
              <td>{emp.name}</td>
              <td className="status-icon">
                {isSubmitted(emp.email) ? (
                  <CheckCircle className="icon-success" size={20} />
                ) : (
                  <XCircle className="icon-failure" size={20} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
