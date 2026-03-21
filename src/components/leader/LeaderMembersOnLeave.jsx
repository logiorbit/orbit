import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import {
  getLeavesForDate,
  getLeavesForMonth,
  getLeavesForYear,
} from "../../services/sharePointService";
import { useUserContext } from "../../context/UserContext";
import DataTable from "../common/DataTable";
import "../common/tableHeader.css";

export default function LeaderMembersOnLeave() {
  const { instance, accounts } = useMsal();
  const { employeeHierarchy, userProfile } = useUserContext();

  const today = new Date();

  // ---------------- DATE ----------------
  const [date, setDate] = useState(today.toISOString().split("T")[0]);
  const [dateRows, setDateRows] = useState([]);

  // ---------------- MONTH ----------------
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [monthYear, setMonthYear] = useState(today.getFullYear());
  const [monthRows, setMonthRows] = useState([]);

  // ---------------- YEAR ----------------
  const [year, setYear] = useState(today.getFullYear());
  const [yearRows, setYearRows] = useState([]);

  // ---------------- COLUMNS ----------------
  const columns = [
    { key: "Employee", label: "Employee" },
    { key: "LeaveType", label: "Leave Type" },
    { key: "StartDate", label: "Start Date" },
    { key: "EndDate", label: "End Date" },
    { key: "NoOfDays", label: "No. of Days" },
    { key: "Status", label: "Status" },
  ];

  // ---------------- HELPERS ----------------
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN");
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);

    const diff = e - s;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // inclusive
  };

  const mapData = (rows) =>
    rows.map((l) => ({
      Id: l.Id,
      Employee: l.Employee?.Title,
      LeaveType: l.LeaveType?.Title,
      StartDate: formatDate(l.StartDate),
      EndDate: formatDate(l.EndDate),
      NoOfDays: calculateDays(l.StartDate, l.EndDate),
      Status: l.Status,
    }));

  // ---------------- LOADERS ----------------
  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    async function loadDate() {
      const token = await getAccessToken(instance, accounts[0]);
      const leaves = await getLeavesForDate(token, date);
      setDateRows(leaves);
    }

    loadDate();
  }, [date, employeeHierarchy, userProfile]);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    async function loadMonth() {
      const token = await getAccessToken(instance, accounts[0]);
      const leaves = await getLeavesForMonth(token, monthYear, month);
      setMonthRows(leaves);
    }

    loadMonth();
  }, [month, monthYear, employeeHierarchy, userProfile]);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    async function loadYear() {
      const token = await getAccessToken(instance, accounts[0]);
      const leaves = await getLeavesForYear(token, year);
      setYearRows(leaves);
    }

    loadYear();
  }, [year, employeeHierarchy, userProfile]);

  return (
    <>
      {/* DATE */}
      <div className="card">
        <div className="table-header">
          <h3>Members on Leave (By Date)</h3>

          <div className="table-filters">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <DataTable columns={columns} data={mapData(dateRows)} />
      </div>

      {/* MONTH */}
      <div className="card">
        <div className="table-header">
          <h3>Members on Leave (By Month)</h3>

          <div className="table-filters">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={monthYear}
              onChange={(e) => setMonthYear(Number(e.target.value))}
            />
          </div>
        </div>

        <DataTable columns={columns} data={mapData(monthRows)} />
      </div>

      {/* YEAR */}
      <div className="card">
        <div className="table-header">
          <h3>Members on Leave (By Year)</h3>

          <div className="table-filters">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
        </div>

        <DataTable columns={columns} data={mapData(yearRows)} />
      </div>
    </>
  );
}
