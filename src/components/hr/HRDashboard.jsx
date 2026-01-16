import { useState } from "react";
import SubmitTimesheet from "./SubmitTimesheetModal";
import TimesheetStatusTable from "./TimesheetStatusTable";
import "./HRDashboard.css";

export default function HRDashboard() {
  const [showSubmitTimesheet, setShowSubmitTimesheet] = useState(false);
  const [month, setMonth] = useState("Jan");
  const [year, setYear] = useState(new Date().getFullYear());

  const employees = window.employeeHierarchyData;
  const timesheets = window.timesheetData;

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

        <div className="manager-dashboard two-column-layout">
          {/* LEFT HALF */}
          <div className="left-panel">
            <TimesheetStatusTable
              employees={employees}
              timesheets={timesheets}
              selectedMonth={month}
              selectedYear={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
            />
          </div>
          {/* RIGHT HALF */}
          <div className="right-panel">
            <div className="btn-div">
              <button
                className="primary-btn"
                onClick={() => setShowSubmitTimesheet(true)}
              >
                + Submit Timesheet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showSubmitTimesheet && (
        <SubmitTimesheet onClose={() => setShowSubmitTimesheet(false)} />
      )}
    </>
  );
}
