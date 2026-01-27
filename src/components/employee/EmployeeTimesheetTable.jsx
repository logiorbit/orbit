export default function EmployeeTimesheetTable({
  timesheets,
  onEdit,
  onDelete,
}) {
  function canModify(status) {
    return status === "Submitted";
  }

  return (
    <div className="card">
      <h3>My Timesheets</h3>

      <table className="data-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Year</th>
            <th>Hours</th>
            <th>Days</th>
            <th>Status</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {timesheets.length === 0 ? (
            <tr>
              <td colSpan="7">No timesheets found</td>
            </tr>
          ) : (
            timesheets.map((ts) => {
              const editable = canModify(ts.Status);

              return (
                <tr key={ts.Id}>
                  <td>{ts.Month}</td>
                  <td>{ts.Year}</td>
                  <td>{ts.TotalBillingHours ?? "-"}</td>
                  <td>{ts.TotalBillingDays ?? "-"}</td>
                  <td>
                    <span className={`status-badge ${ts.Status}`}>
                      {ts.Status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="icon-btn"
                      disabled={!editable}
                      title={
                        editable
                          ? "Edit Timesheet"
                          : "Timesheet locked after HR approval"
                      }
                      onClick={() => onEdit(ts)}
                    >
                      ✏️
                    </button>
                  </td>

                  <td>
                    <button
                      className="icon-btn danger"
                      disabled={!editable}
                      title={
                        editable
                          ? "Delete Timesheet"
                          : "Timesheet locked after HR approval"
                      }
                      onClick={() => onDelete(ts)}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
