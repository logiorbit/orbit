import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
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
  const [showSubmitTimesheet, setShowSubmitTimesheet] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [month, setMonth] = useState("January");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null); // 👈 Added missing token state

  /* ============================
     1️⃣ Acquire Access Token
     ============================ */
  useEffect(() => {
    async function acquireToken() {
      if (!accounts || accounts.length === 0) return;

      try {
        const acquiredToken = await getAccessToken(instance, accounts[0]);
        setToken(acquiredToken); // 👈 Use setToken instead of undefined setAccessToken
      } catch (error) {
        console.error("Failed to acquire token:", error);
        setToken(null);
      }
    }

    acquireToken();
  }, [instance, accounts]);

  /* ============================
     2️⃣ Load SharePoint Data
     ============================ */
  useEffect(() => {
    if (!token) return;

    async function loadData() {
      setLoading(true);

      try {
        const [hierarchy, ts] = await Promise.all([
          getEmployeeHierarchy(token),
          getTimesheetsForMonth(token, month, year),
        ]);

        setEmployees(hierarchy);
        setTimesheets(ts);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token, month, year]); // 👈 token now properly in deps

  if (loading) {
    return <div className="hr-card">Loading Timesheet Status…</div>;
  }

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
              month={month}
              year={year}
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
