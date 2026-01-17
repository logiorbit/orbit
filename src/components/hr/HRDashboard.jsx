import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";

import SubmitTimesheet from "./SubmitTimesheetModal";
import TimesheetStatusTable from "./TimesheetStatusTable";
import MonthYearFilter from "./MonthYearFilter";

import { getAccessToken } from "../../auth/authService";
import {
  getEmployeeHierarchy,
  getTimesheetsForMonth,
} from "../../services/sharePointService";

import "./HRDashboard.css";

export default function HRDashboard() {
  const { instance, accounts } = useMsal();

  const [showSubmitTimesheet, setShowSubmitTimesheet] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [month, setMonth] = useState("Jan");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  /* ============================
     1️⃣ Acquire Access Token
     ============================ */
  useEffect(() => {
    if (!accounts || accounts.length === 0) return;

    getAccessToken(instance, accounts[0])
      .then(setToken)
      .catch((err) => {
        console.error("Failed to acquire token:", err);
        setToken(null);
      });
  }, [instance, accounts]);

  /* ============================
     2️⃣ Load SharePoint Data
     ============================ */
  useEffect(() => {
    if (!token) return;

    setLoading(true);

    Promise.all([
      getEmployeeHierarchy(token),
      getTimesheetsForMonth(token, month, year),
    ])
      .then(([hierarchy, ts]) => {
        setEmployees(
          Array.isArray(hierarchy) ? hierarchy : hierarchy?.value || []
        );
        setTimesheets(Array.isArray(ts) ? ts : ts?.value || []);
      })
      .catch((error) => {
        console.error("Failed to load SharePoint data:", error);
        setEmployees([]);
        setTimesheets([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, month, year]);

  /* ============================
     3️⃣ Render (NO EARLY RETURN)
     ============================ */
  return (
    <>
      <div className="manager-dashboard">
        {/* ✅ MONTH / YEAR FILTER — ALWAYS VISIBLE */}
        <MonthYearFilter
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />

        {loading ? (
          <div className="hr-card">Loading Timesheet Status…</div>
        ) : (
          <>
            <div className="btn-div">
              <button
                className="primary-btn"
                onClick={() => setShowSubmitTimesheet(true)}
              >
                + Submit Timesheet
              </button>
            </div>

            <div className="manager-grid-2">
              <div className="card">
                <h3>
                  Timesheet Status — {month} {year}
                </h3>
                <TimesheetStatusTable
                  employees={employees}
                  timesheets={timesheets}
                  month={month}
                  year={year}
                />
              </div>

              <div className="card">
                <h3>
                  Timesheet Status — {month} {year}
                </h3>
                <TimesheetStatusTable
                  employees={employees}
                  timesheets={timesheets}
                  month={month}
                  year={year}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {showSubmitTimesheet && (
        <SubmitTimesheet onClose={() => setShowSubmitTimesheet(false)} />
      )}
    </>
  );
}
