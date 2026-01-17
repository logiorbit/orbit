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
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  /* ============================
     1️⃣ Acquire Access Token
     ============================ */
  useEffect(() => {
    async function acquireToken() {
      if (!accounts || accounts.length === 0) return;

      try {
        const accessToken = await getAccessToken(instance, accounts[0]);
        setToken(accessToken);
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
        console.error("Failed to load SharePoint data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token, month, year]);

  if (loading) {
    return <div className="hr-card">Loading Timesheet Status…</div>;
  }

  return (
    <>
      <div className="manager-dashboard">
        {/* FILTERS */}
        <MonthYearFilter
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />

        <div className="btn-div">
          <button
            className="primary-btn"
            onClick={() => setShowSubmitTimesheet(true)}
          >
            + Submit Timesheet
          </button>
        </div>

        {/* STATUS TABLE */}
        <TimesheetStatusTable employees={employees} timesheets={timesheets} />
      </div>

      {/* MODAL */}
      {showSubmitTimesheet && (
        <SubmitTimesheet onClose={() => setShowSubmitTimesheet(false)} />
      )}
    </>
  );
}
