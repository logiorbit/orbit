import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useUserContext } from "../../context/UserContext";
import { getAccessToken } from "../../auth/authService";
import { getMyLeaves } from "../../services/sharePointService";

import "./dashboard.css";
import ChartCard from "./ChartCard";
import LeaveBalanceCards from "../employee/LeaveBalanceCards";
import MyLeavesTable from "../employee/MyLeavesTable";
import ApplyLeaveModal from "../employee/ApplyLeaveModal";
import CreateTaskModal from "../employee/CreateTaskModal";
import EmployeeTaskCards from "../employee/EmployeeTaskCards";
import EmployeeKpiCards from "../employee/EmployeeKpiCards";
import MyTasksTable from "../employee/MyTasksTable";
import EditEmployeeProfileModal from "../employee/EditEmployeeProfileModal";

import TLDashboard from "../tl/TLDashboard";
import ManagerDashboard from "../manager/ManagerDashboard";
import LeaderDashboard from "../leader/LeaderDashboard";
import HRDashboard from "../hr/HRDashboard";
import { leaveTrendData } from "../../utils/chartData";
import HolidayTable from "../employee/HolidayTable";
import { getHolidaysForYear } from "../../services/sharePointService";

export default function Dashboard() {
  const { userRoles } = useUserContext();
  const [activeTab, setActiveTab] = useState("EMPLOYEE");

  if (!userRoles) return null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "EMPLOYEE" ? "active" : ""}`}
          onClick={() => setActiveTab("EMPLOYEE")}
        >
          Employee
        </button>

        {userRoles.isTL && (
          <button
            className={`tab-btn ${activeTab === "TL" ? "active" : ""}`}
            onClick={() => setActiveTab("TL")}
          >
            ATL / TL / GTL
          </button>
        )}

        {userRoles.isManager && (
          <button
            className={`tab-btn ${activeTab === "MANAGER" ? "active" : ""}`}
            onClick={() => setActiveTab("MANAGER")}
          >
            Manager
          </button>
        )}

        {(userRoles.isLeadership || userRoles.isHR) && (
          <button
            className={`tab-btn ${activeTab === "HR" ? "active" : ""}`}
            onClick={() => setActiveTab("HR")}
          >
            HR
          </button>
        )}

        {userRoles.isLeadership && (
          <button
            className={`tab-btn ${activeTab === "LEADERSHIP" ? "active" : ""}`}
            onClick={() => setActiveTab("LEADERSHIP")}
          >
            Leadership
          </button>
        )}
      </div>

      {activeTab === "EMPLOYEE" && <EmployeeDashboard />}
      {activeTab === "TL" && <TLDashboard />}
      {activeTab === "MANAGER" && <ManagerDashboard />}
      {activeTab === "HR" && <HRDashboard />}
      {activeTab === "LEADERSHIP" && <LeaderDashboard />}
    </div>
  );
}

function EmployeeDashboard() {
  const { instance, accounts } = useMsal();

  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  const [showApply, setShowApply] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showHoliday, setShowHoliday] = useState(false);
  const [leaveRefreshKey, setLeaveRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      if (!accounts?.length) return;

      const token = await getAccessToken(instance, accounts[0]);

      const leaveData = await getMyLeaves(token, accounts[0].username);
      setLeaves(leaveData);

      const year = new Date().getFullYear();
      const holidayData = await getHolidaysForYear(token, year);
      setHolidays(holidayData);
    }

    load();
  }, [accounts]);

  return (
    <>
      <div className="dashboard-header">
        <div></div>

        <div className="btn-div">
          <button className="primary-btn" onClick={() => setShowApply(true)}>
            + Apply Leave
          </button>

          <button
            className="primary-btn"
            onClick={() => setShowCreateTask(true)}
          >
            + Add Task
          </button>

          <button className="primary-btn" onClick={() => setShowHoliday(true)}>
            Holiday List
          </button>

          <button className="primary-btn" onClick={() => setShowProfile(true)}>
            Edit Profile
          </button>
        </div>
      </div>

      <div className="employee-dashboard-grid">
        {/* LEFT COLUMN */}
        <div className="employee-left">
          <LeaveBalanceCards />

          <div className="card" style={{ marginTop: 24 }}>
            <h3>My Leaves – {new Date().getFullYear()}</h3>
            <MyLeavesTable
              leaves={leaves}
              refreshKey={leaveRefreshKey}
              onRefresh={() => setLeaveRefreshKey((prev) => prev + 1)}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="employee-right">
          <EmployeeKpiCards />

          <div className="card" style={{ marginTop: 24 }}>
            <h3>My Tasks</h3>
            <MyTasksTable />
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showApply && <ApplyLeaveModal onClose={() => setShowApply(false)} />}

      {showProfile && (
        <EditEmployeeProfileModal
          onClose={() => setShowProfile(false)}
          onSuccess={() => setShowProfile(false)}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onSuccess={() => setShowCreateTask(false)}
        />
      )}

      {showHoliday && (
        <HolidayTable
          holidays={holidays}
          onClose={() => setShowHoliday(false)}
        />
      )}
    </>
  );
}
