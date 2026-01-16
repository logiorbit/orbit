import submitTimesheet from "./submitTimesheet";
import "./HRDashboard.css";

export default function ManagerDashboard() {
  const [submitTimesheet, setSubmitTimesheet] = useState(false);

  return (
    <>
      <div className="manager-dashboard">
        <div className="btn-div">
          <button
            className="primary-btn"
            onClick={() => setSubmitTimesheet(true)}
          >
            + Apply Leave
          </button>
        </div>
      </div>

      {/* MODALS */}
      {submitTimesheet && (
        <submitTimesheet onClose={() => setSubmitTimesheet(false)} />
      )}
    </>
  );
}
