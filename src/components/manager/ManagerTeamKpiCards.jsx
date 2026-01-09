import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import { useUserContext } from "../../context/UserContext";
import {
  getManagerTeamMembers,
  getTeamTasksForPeriod,
} from "../../services/sharePointService";

import "./managerDashboard.css";

export default function ManagerTeamKpiCards() {
  const { instance, accounts } = useMsal();
  const { employeeHierarchy, userProfile } = useUserContext();

  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile || !accounts?.length) return;

    async function load() {
      const token = await getAccessToken(instance, accounts[0]);

      // 🔹 Manager team resolution
      const teamMembers = getManagerTeamMembers(
        employeeHierarchy,
        userProfile.email
      );

      const teamSize = teamMembers.length;
      const capacityPerDay = teamSize * 9;

      const today = await getTeamTasksForPeriod(token, "today", teamMembers);

      const week = await getTeamTasksForPeriod(token, "week", teamMembers);

      const month = await getTeamTasksForPeriod(token, "month", teamMembers);

      setKpis({
        capacityPerDay,
        today,
        week,
        month,
      });
    }

    load();
  }, [employeeHierarchy, userProfile, accounts, instance]);

  if (!kpis) return null;

  return (
    <div className="manager-kpi-row">
      <ManagerKpi
        title="Productive Today"
        used={kpis.today.productive}
        cap={kpis.capacityPerDay}
      />
      <ManagerKpi
        title="Productive This Week"
        used={kpis.week.productive}
        cap={kpis.capacityPerDay * 5}
      />
      <ManagerKpi
        title="Productive This Month"
        used={kpis.month.productive}
        cap={kpis.capacityPerDay * 22}
      />

      <ManagerKpi
        title="Billed Today"
        used={kpis.today.billed}
        cap={kpis.capacityPerDay}
      />
      <ManagerKpi
        title="Billed This Week"
        used={kpis.week.billed}
        cap={kpis.capacityPerDay * 5}
      />
      <ManagerKpi
        title="Billed This Month"
        used={kpis.month.billed}
        cap={kpis.capacityPerDay * 22}
      />
    </div>
  );
}

function ManagerKpi({ title, used, cap }) {
  const percent = cap > 0 ? Math.round((used / cap) * 100) : 0;

  return (
    <div className="manager-kpi-card">
      <div className="manager-kpi-title">{title}</div>
      <div className="manager-kpi-value">
        {used} / {cap} hrs
      </div>
      <div className="manager-kpi-percent">{percent}%</div>
    </div>
  );
}
