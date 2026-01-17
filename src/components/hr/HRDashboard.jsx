import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";

import TimesheetStatusTable from "./TimesheetStatusTable";
import { getAccessToken } from "../../auth/authService";
import {
  getEmployeeHierarchy,
  getTimesheetsForMonth,
} from "../../services/sharePointService";

export default function HRDashboard() {
  const { instance, accounts } = useMsal();

  const [employees, setEmployees] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [month, setMonth] = useState("Jan");
  const [year, setYear] = useState(new Date().getFullYear());
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (!accounts?.length) return;
    getAccessToken(instance, accounts[0]).then(setToken);
  }, [instance, accounts]);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      getEmployeeHierarchy(token),
      getTimesheetsForMonth(token, month, year),
    ]).then(([hierarchy, ts]) => {
      // ✅ CRITICAL: extract .value
      setEmployees(hierarchy?.value ?? []);
      setTimesheets(ts?.value ?? []);
    });
  }, [token, month, year]);

  return <TimesheetStatusTable employees={employees} timesheets={timesheets} />;
}
