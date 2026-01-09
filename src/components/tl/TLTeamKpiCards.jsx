import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import { useUserContext } from "../../context/UserContext";
import {
  getTeamTasksForPeriod,
  getTeamMembers,
} from "../../services/sharePointService";

import "./tlDashboard.css"; // ✅ TL-only styles

export default function TLTeamKpiCards() {
  const { instance, accounts } = useMsal();
  const { employeeHierarchy, userProfile } = useUserContext();

  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    if (!employeeHierarchy || !userProfile) return;

    async function load() {
      const token = await getAccessToken(instance, accounts[0]);

      const teamMembers = getTeamMembers(employeeHierarchy, userProfile.email);

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
  }, [employeeHierarchy, userProfile]);

  if (!kpis) return null;

  return (
    <div className="tl-kpi-row">
      <Kpi
        title="Productive Today"
        used={kpis.today.productive}
        cap={kpis.capacityPerDay}
      />
      <Kpi
        title="Productive Week"
        used={kpis.week.productive}
        cap={kpis.capacityPerDay * 5}
      />
      <Kpi
        title="Productive Month"
        used={kpis.month.productive}
        cap={kpis.capacityPerDay * 22}
      />

      <Kpi
        title="Billed Today"
        used={kpis.today.billed}
        cap={kpis.capacityPerDay}
      />
      <Kpi
        title="Billed Week"
        used={kpis.week.billed}
        cap={kpis.capacityPerDay * 5}
      />
      <Kpi
        title="Billed Month"
        used={kpis.month.billed}
        cap={kpis.capacityPerDay * 22}
      />
    </div>
  );
}

/* ---------- KPI CARD ---------- */

function Kpi({ title, used, cap }) {
  const percent = cap ? Math.round((used / cap) * 100) : 0;

  return (
    <div className="tl-kpi-card">
      <div className="tl-kpi-title">{title}</div>
      <div className="tl-kpi-value">
        {used} / {cap} hrs
      </div>
      <div className="tl-kpi-value">{percent}%</div>
    </div>
  );
}
