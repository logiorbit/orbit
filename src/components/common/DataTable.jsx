import * as XLSX from "xlsx";
import StatusBadge from "./StatusBadge";
import "./table.css";

export default function DataTable({
  columns,
  data = [],
  renderActions,
  enableExport = false,
  exportFileName = "table-data",
}) {
  function exportToExcel() {
    if (!data || data.length === 0) return;

    // Build export rows based on visible columns
    const exportRows = data.map((row) => {
      const obj = {};
      columns.forEach((col) => {
        obj[col.label] = row[col.key];
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    XLSX.writeFile(workbook, `data.xlsx`);
  }

  return (
    <div className="table-card">
      {/* Toolbar */}
      <div className="table-toolbar">
        <div />
        <button className="btn secondary-btn" onClick={exportToExcel}>
          ⬇ Export Excel
        </button>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {renderActions && <th />}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="empty">
                  No records found
                </td>
              </tr>
            )}

            {data.map((row) => (
              <tr key={row.Id}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.key === "Status" ? (
                      <StatusBadge status={row[col.key]} />
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}

                {renderActions && (
                  <td className="actions">{renderActions(row)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
