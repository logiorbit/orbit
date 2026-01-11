import { useState } from "react";
import LeaderMembersOnLeave from "./LeaderMembersOnLeave";
import LeaderUnderAllocatedTable from "./LeaderUnderAllocatedTable";
import LeaderTasksByClientDate from "./LeaderTasksByClientDate";
import LeaderTeamMembersTable from "./LeaderTeamMembersTable";
import LeaderBillingMatrix from "./LeaderBillingMatrix";
import LeaderTeamTasksTable from "./LeaderTeamTasksTable";

import "./leadershipTabs.css";

export default function LeadershipTabs() {
  const [activeTab, setActiveTab] = useState("one");

  return (
    <div className="leadership-tabs-card">
      {/* TAB HEADERS */}
      <div className="leadership-tabs-header">
        <button
          className={`leadership-tab ${activeTab === "one" ? "active" : ""}`}
          onClick={() => setActiveTab("one")}
        >
          Leave Management
        </button>

        <button
          className={`leadership-tab ${activeTab === "two" ? "active" : ""}`}
          onClick={() => setActiveTab("two")}
        >
          Task Management
        </button>

        <button
          className={`leadership-tab ${activeTab === "three" ? "active" : ""}`}
          onClick={() => setActiveTab("three")}
        >
          Resource Management
        </button>
        <button
          className={`leadership-tab ${activeTab === "four" ? "active" : ""}`}
          onClick={() => setActiveTab("four")}
        >
          Timesheet Management
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="leadership-tab-content">
        {activeTab === "one" && (
          <div>
            <LeaderMembersOnLeave />
          </div>
        )}
        {activeTab === "two" && (
          <div>
            <LeaderUnderAllocatedTable />
            <div>
              <h2> </h2>
            </div>
            <LeaderTasksByClientDate />
            <div>
              <h2></h2>
            </div>
            <LeaderTeamTasksTable />
          </div>
        )}
        {activeTab === "three" && (
          <div>
            <LeaderTeamMembersTable />
          </div>
        )}
        {activeTab === "four" && (
          <div>
            <LeaderBillingMatrix />
          </div>
        )}
      </div>
    </div>
  );
}
