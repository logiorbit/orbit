import { useState } from "react";
import SubmitTimesheet from "./SubmitTimesheetModal";
import "./HRDashboard.css";

export default function HRDashboard() {
  const [showSubmitTimesheet, setShowSubmitTimesheet] = useState(false);

  return (
    <>
      <div className="manager-dashboard">
        <div className="btn-div">
          <button
            className="primary-btn"
            onClick={() => setShowSubmitTimesheet(true)}
          >
            + Submit Timesheet
          </button>
        </div>
      </div>

      {/* MODALS */}
      {showSubmitTimesheet && (
        <SubmitTimesheet onClose={() => setShowSubmitTimesheet(false)} />
      )}
    </>
  );
}
