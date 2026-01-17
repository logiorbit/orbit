import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";

import MonthYearFilter from "./MonthYearFilter";
import SubmitTimesheet from "./SubmitTimesheetModal";
import TimesheetStatusTable from "./TimesheetStatusTable";

import { getAccessToken } from "../../auth/authService";
import {
  getEmployeeHierarchy,
  getTimesheetsForMonth,
} from "../../services/sharePointService";

import "./HRDashboard.css";

export default function HRDashboard() {
  const { instance, accounts } = useMsal();

  const [employees, setEmployees] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [month, setMonth] = useState("Jan");
  const [year, setYear] = useState(new Date().getFullYear());
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitTimesheet, setShowSubmitTimesheet] = useState(false);

  /* Acquire token */
  useEffect(() => {
    if (!accounts?.length) return;

    getAccessToken(instance, accounts[0])
      .then(setToken)
      .catch(() => setToken(null));
  }, [instance, accounts]);

  /* Load SharePoint data */
  useEffect(() => {
    if (!token) return;

    setLoading(true);

    Promise.all([
      getEmployeeHierarchy(token),
      getTimesheetsForMonth(token, month, year),
    ])
      .then(([hierarchy, ts]) => {
        setEmployees(hierarchy?.value || []);
        setTimesheets(ts?.value || []);
      })
      .finally(() => setLoading(false));
  }, [token, month, year]);

  if (loading) {
    return <div className="hr-card">Loading Timesheet Status…</div>;
  }

  return (
    <div className="manager-dashboard">
      {/* FILTERS */}
      <MonthYearFilter
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
      />

      {/* ACTION BUTTON */}
      <div className="btn-div">
        <button
          className="primary-btn"
          onClick={() => setShowSubmitTimesheet(true)}
        >
          + Submit Timesheet
        </button>
      </div>

      {/* TABLE */}
      <TimesheetStatusTable employees={employees} timesheets={timesheets} />

      {showSubmitTimesheet && (
        <SubmitTimesheet onClose={() => setShowSubmitTimesheet(false)} />
      )}
    </div>
  );
}
