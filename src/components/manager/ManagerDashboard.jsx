import ManagerTeamKpiCards from "./ManagerTeamKpiCards";
import ManagerTeamMembersTable from "./ManagerTeamMembersTable";
import ManagerApprovalTable from "./ManagerApprovalTable";
import ManagerUnderAllocatedTable from "./ManagerUnderAllocatedTable";
import ManagerMembersOnLeave from "./ManagerMembersOnLeave";
import ManagerTasksByClientDate from "./ManagerTasksByClientDate";
import ManagerBillingMatrix from "./ManagerBillingMatrix";
import ManagerTeamTasksTable from "./ManagerTeamTasksTable";

import "./managerDashboard.css";

export default function ManagerDashboard() {
  return (
    <>
      <div className="manager-dashboard">
        {/* ===== KPI CARDS (3 + 3) ===== */}
        <ManagerTeamKpiCards />

        {/* ===== TABLE ROW 1 ===== */}
        <div className="manager-grid-2">
          <div className="card">
            <h3>Team Members</h3>
            <ManagerTeamMembersTable />
          </div>

          <div className="card">
            <h3>Pending Leave Approvals</h3>
            <ManagerApprovalTable />
          </div>
        </div>

        {/* ===== TABLE ROW 2 ===== */}
        <div className="manager-grid-2">
          <div className="card">
            <ManagerUnderAllocatedTable />
          </div>

          <div className="card">
            <ManagerMembersOnLeave />
          </div>
        </div>

        <div className="manager-grid-2">
          <div className="card">
            <ManagerTasksByClientDate />
          </div>

          <div className="card">
            <ManagerTeamTasksTable />
          </div>
        </div>

        {/* ===== FULL WIDTH ===== */}
        <div className="card full-width">
          <ManagerBillingMatrix />
        </div>
      </div>
    </>
  );
}
