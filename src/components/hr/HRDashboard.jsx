import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useUserContext } from "../../context/UserContext";
import { getAccessToken } from "../../auth/authService";

import submitTimesheet from "./submitTimesheet";
import "./HRDashboard.css";

export default function ManagerDashboard() {
  const [submitTimesheet, setSubmitTimesheet] = useState(false);

  return (
    <>
      <div className="manager-dashboard">
        <div className="btn-div">
          <button
            className="primary-btn"
            onClick={() => setSubmitTimesheet(true)}
          >
            + Apply Leave
          </button>
        </div>
      </div>

      {/* MODALS */}
      {submitTimesheet && (
        <submitTimesheet onClose={() => setSubmitTimesheet(false)} />
      )}
    </>
  );
}
