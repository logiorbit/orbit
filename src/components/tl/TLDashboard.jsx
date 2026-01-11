import TLTeamKpiCards from "./TLTeamKpiCards";
import TLTeamMembersTable from "./TLTeamMembersTable";
import TLApprovalTable from "./TLApprovalTable";
import TLUnderAllocatedTable from "./TLUnderAllocatedTable";
import TLMembersOnLeave from "./TLMembersOnLeave";
import TLBilledHoursMatrix from "./TLBilledHoursMatrix";
import TLTasksByClientDate from "./TLTasksByClientDate";
import TLTeamTasksTable from "./TLTeamTasksTable";

import "./tlDashboard.css";

export default function TLDashboard() {
  return (
    <div className="tl-dashboard">
      {/* ===== KPI CARDS (3 + 3) ===== */}
      <TLTeamKpiCards />

      {/* ===== TABLE ROW 1 ===== */}
      <div className="tl-grid-2">
        <div className="card">
          <h3>Team Members</h3>
          <TLTeamMembersTable />
        </div>

        <div className="card">
          <h3>Pending Leave Approvals</h3>
          <TLApprovalTable />
        </div>
      </div>

      {/* ===== TABLE ROW 2 ===== */}
      <div className="tl-grid-2">
        <div className="card">
          <TLUnderAllocatedTable />
        </div>

        <div className="card">
          <TLMembersOnLeave />
        </div>
      </div>

      <div className="tl-grid-2">
        <div className="card">
          <TLTasksByClientDate />
        </div>

        <div className="card">
          <TLTeamTasksTable />
        </div>
      </div>

      {/* ===== FULL WIDTH ===== */}
      <div className="card full-width">
        <TLBilledHoursMatrix />
      </div>
    </div>
  );
}
