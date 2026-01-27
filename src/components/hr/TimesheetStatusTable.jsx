import { CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";

/* ============================
   Date Helpers
   ============================ */
function getMonthRange(month, year) {
  const map = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const start = new Date(year, map[month], 1);
  const end = new Date(year, map[month] + 1, 0);
  return { start, end };
}

function isAssignmentActiveForMonth(a, month, year) {
  if (!a.Active) return false;

  const { start, end } = getMonthRange(month, year);
  const billingStart = new Date(a.BillingStartDate);
  const billingEnd = a.BillingEndDate ? new Date(a.BillingEndDate) : null;

  return billingStart <= end && (!billingEnd || billingEnd >= start);
}

export default function TimesheetStatusTable({
  assignments = [],
  timesheets = [],
  month,
  year,
  onEdit,
  onDelete,
}) {
  function findTimesheet(a) {
    return timesheets.find(
      (ts) =>
        ts.EmployeeHierarchy?.EmployeeEmail === a.Employee?.EmployeeEmail &&
        ts.Client?.Id === a.Client?.Id,
    );
  }

  function resolveFlags(status) {
    console.log("Pankaj Status is--" + status);
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

  const activeAssignments = assignments.filter((a) =>
    isAssignmentActiveForMonth(a, month, year),
  );

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <strong>
          Timesheet Status — {month} {year}
        </strong>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Client</th>
            <th>Submitted</th>
            <th>HR Approved</th>
            <th>Invoice Created</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {activeAssignments.map((a) => {
            const ts = findTimesheet(a);
            const flags = resolveFlags(ts?.Status);

            const canEdit = ts && flags.submitted;
            const canDelete =
              ts &&
              flags.submitted &&
              ts.Status !== "HR Approved" &&
              ts.Status !== "Invoice Created";

            return (
              <tr key={`${a.Employee.Id}-${a.Client.Id}`}>
                <td>{a.Employee?.Title}</td>
                <td>{a.Client?.Title}</td>

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
                    onClick={() => canEdit && onEdit(ts)}
                  />
                </td>

                <td className="actions">
                  <Trash2
                    size={16}
                    className={
                      canDelete ? "action-icon delete" : "action-icon disabled"
                    }
                    onClick={() => canDelete && onDelete(ts)}
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
