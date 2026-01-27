import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import {
  getCurrentUser,
  getMyTasksForDate,
} from "../../services/sharePointService";
import { getTaskKPIs } from "../../services/taskAnalyticsService";

export default function EmployeeTaskCards() {
  const { instance, accounts } = useMsal();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = await getAccessToken(instance, accounts[0]);
        const user = await getCurrentUser(token);

        // 🔹 Fetch tasks for TODAY only (safe baseline)
        const today = new Date();
        const todayTasks = await getMyTasksForDate(token, user.Id, today);

        setTasks(todayTasks);
      } catch (err) {
        console.error("EmployeeTaskCards error", err);
      } finally {
        setLoading(false);
      }
    }

    if (accounts?.length) {
      load();
    }
  }, [accounts, instance]);

  if (loading) return null;

  const todayKPI = getTaskKPIs({
    tasks,
    period: "TODAY",
    peopleCount: 1,
  });

  return (
    <div className="kpi-row">
      <div className="kpi-card">
        <span className="kpi-title">Estimated Today</span>
        <span className="kpi-value">{todayKPI.allocated} hrs</span>
      </div>

      <div className="kpi-card">
        <span className="kpi-title">Billable Today</span>
        <span className="kpi-value">{todayKPI.billable} hrs</span>
      </div>

      <div className="kpi-card">
        <span className="kpi-title">Productive Today</span>
        <span className="kpi-value">{todayKPI.productive} hrs</span>
      </div>
    </div>
  );
}
