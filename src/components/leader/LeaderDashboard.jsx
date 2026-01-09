import LeaderTeamKpiCards from "./LeaderTeamKpiCards";
import LeadershipTabs from "./LeadershipTabs";

//import ManagerTeamMembersTable from "./ManagerTeamMembersTable";
//import ManagerApprovalTable from "./ManagerApprovalTable";
//import ManagerUnderAllocatedTable from "./ManagerUnderAllocatedTable";
//import ManagerMembersOnLeave from "./ManagerMembersOnLeave";
//import ManagerTasksByClientDate from "./ManagerTasksByClientDate";
//import ManagerBillingMatrix from "./ManagerBillingMatrix";

import "./leadDashboard.css";

export default function LeaderDashboard() {
  return (
    <>
      <div className="manager-dashboard">
        {/* ===== KPI CARDS (3 + 3) ===== */}
        <LeaderTeamKpiCards />
      </div>
      <LeadershipTabs />
    </>
  );
}
