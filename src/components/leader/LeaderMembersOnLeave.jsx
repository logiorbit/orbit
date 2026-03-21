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

  // ---------------- DATE ----------------
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateRows, setDateRows] = useState([]);

  // ---------------- MONTH ----------------
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
  const [monthYear, setMonthYear] = useState(today.getFullYear());
  const [monthRows, setMonthRows] = useState([]);

  // ---------------- YEAR ----------------
  const [year, setYear] = useState(today.getFullYear());
  const [yearRows, setYearRows] = useState([]);

  const columns = [
    { key: "Employee", label: "Employee" },
    { key: "LeaveType", label: "Leave Type" },
    { key: "Status", label: "Status" },
  ];

  // ---------------- LOAD DATE ----------------
  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    async function loadDate() {
      const token = await getAccessToken(instance, accounts[0]);
      const leaves = await getLeavesForDate(token, date);
      setDateRows(leaves);
    }

    loadDate();
  }, [date, employeeHierarchy, userProfile]);

  // ---------------- LOAD MONTH ----------------
  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    async function loadMonth() {
      const token = await getAccessToken(instance, accounts[0]);
      const leaves = await getLeavesForMonth(token, monthYear, month);
      setMonthRows(leaves);
    }

    loadMonth();
  }, [month, monthYear, employeeHierarchy, userProfile]);

  // ---------------- LOAD YEAR ----------------
  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    async function loadYear() {
      const token = await getAccessToken(instance, accounts[0]);
      const leaves = await getLeavesForYear(token, year);
      setYearRows(leaves);
    }

    loadYear();
  }, [year, employeeHierarchy, userProfile]);

  const mapData = (rows) =>
    rows.map((l) => ({
      Id: l.Id,
      Employee: l.Employee?.Title,
      LeaveType: l.LeaveType?.Title,
      Status: l.Status,
    }));

  return (
    <>
      {/* ---------------- DATE TABLE ---------------- */}
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

      {/* ---------------- MONTH TABLE ---------------- */}
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
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={monthYear}
              onChange={(e) => setMonthYear(Number(e.target.value))}
              placeholder="Year"
            />
          </div>
        </div>

        <DataTable columns={columns} data={mapData(monthRows)} />
      </div>

      {/* ---------------- YEAR TABLE ---------------- */}
      <div className="card">
        <div className="table-header">
          <h3>Members on Leave (By Year)</h3>

          <div className="table-filters">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              placeholder="Year"
            />
          </div>
        </div>

        <DataTable columns={columns} data={mapData(yearRows)} />
      </div>
    </>
  );
}
