import DataTable from "../common/DataTable";

export default function HolidayTable({ holidays, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ width: 600 }}>
        <div className="modal-header">
          <h3>Holiday List</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.Id}>
                  <td>{h.HolidayDate?.split("T")[0]}</td>
                  <td>{h.Day}</td>
                  <td>{h.Description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
