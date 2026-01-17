import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";

import SubmitTimesheetModal from "./SubmitTimesheetModal";
import EditTimesheetModal from "./EditTimesheetModal";
import TimesheetStatusTable from "./TimesheetStatusTable";
import MonthYearFilter from "./MonthYearFilter";

import { getAccessToken } from "../../auth/authService";
import {
  getEmployeeHierarchy,
  getTimesheetsForMonth,
  deleteTimesheetRecord,
} from "../../services/sharePointService";

import "./HRDashboard.css";

export default function HRDashboard() {
  const { instance, accounts } = useMsal();

  const [token, setToken] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [month, setMonth] = useState("Jan");
  const [year, setYear] = useState(new Date().getFullYear());

  const [showSubmit, setShowSubmit] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =============================
     AUTH
     ============================= */
  useEffect(() => {
    if (!accounts.length) return;
    getAccessToken(instance, accounts[0]).then(setToken);
  }, [instance, accounts]);

  /* =============================
     LOAD DATA
     ============================= */
  async function loadData() {
    if (!token) return;
    setLoading(true);

    const [hierarchy, ts] = await Promise.all([
      getEmployeeHierarchy(token),
      getTimesheetsForMonth(token, month, year),
    ]);

    setEmployees(hierarchy || []);
    setTimesheets(ts || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [token, month, year]);

  async function handleDelete(ts) {
    if (!window.confirm("Delete this timesheet?")) return;
    await deleteTimesheetRecord(token, ts.Id);
    loadData();
  }

  if (loading) {
    return <div className="hr-card">Loading Timesheets…</div>;
  }

  return (
    <>
      <div className="manager-dashboard">
        <MonthYearFilter
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />

        <div className="btn-div">
          <button className="primary-btn" onClick={() => setShowSubmit(true)}>
            + Submit Timesheet
          </button>
        </div>

        <div className="card">
          <h3>
            Timesheet Status — {month} {year}
          </h3>

          <TimesheetStatusTable
            employees={employees}
            timesheets={timesheets}
            onEdit={setEditingTimesheet}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {showSubmit && (
        <SubmitTimesheetModal
          token={token}
          month={month}
          year={year}
          onClose={() => setShowSubmit(false)}
          onSaved={loadData}
        />
      )}

      {editingTimesheet && (
        <EditTimesheetModal
          token={token}
          timesheet={editingTimesheet}
          onClose={() => setEditingTimesheet(null)}
          onSaved={loadData}
        />
      )}
    </>
  );
}
