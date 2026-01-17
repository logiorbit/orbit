import { CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";

export default function TimesheetStatusTable({
  employees = [],
  timesheets = [],
  onEdit,
  onDelete,
}) {
  const timesheetByEmail = {};

  timesheets.forEach((ts) => {
    const email = ts.Employee?.EMail;
    if (email) timesheetByEmail[email.toLowerCase()] = ts;
  });

  function statusFlags(status) {
    return {
      submitted: ["Submitted", "HR Approved", "Invoice Created"].includes(
        status
      ),
      hrApproved: ["HR Approved", "Invoice Created"].includes(status),
      invoice: status === "Invoice Created",
    };
  }

  return (
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
        {employees
          .filter((e) => e.Status === "On Project")
          .map((emp) => {
            const email = emp.Employee?.EMail;
            const ts = email && timesheetByEmail[email.toLowerCase()];
            const flags = statusFlags(ts?.Status);

            return (
              <tr key={email}>
                <td>{emp.Employee?.Title}</td>

                <td>{flags.submitted ? <CheckCircle /> : <XCircle />}</td>
                <td>{flags.hrApproved ? <CheckCircle /> : <XCircle />}</td>
                <td>{flags.invoice ? <CheckCircle /> : <XCircle />}</td>

                <td>
                  {flags.submitted && (
                    <Pencil
                      className="action-icon edit"
                      onClick={() => onEdit(ts)}
                    />
                  )}
                </td>

                <td>
                  {flags.submitted && ts?.Status !== "HR Approved" && (
                    <Trash2
                      className="action-icon delete"
                      onClick={() => onDelete(ts)}
                    />
                  )}
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
