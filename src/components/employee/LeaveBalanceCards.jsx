import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import { getLeaveEntitlements } from "../../services/sharePointService";
import { useUserContext } from "../../context/UserContext";

export default function LeaveBalanceCards() {
  const { instance, accounts } = useMsal();
  const { userProfile } = useUserContext();
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      const year = new Date().getFullYear();

      const data = await getLeaveEntitlements(token, userProfile.email, year);

      setBalances(data);
    }

    load();
  }, []);

  return (
    <div className="leave-section">
      <div className="leave-card-grid">
        {balances.map((item, idx) => (
          <div key={idx} className="leave-card">
            <div className="leave-card-header">{item.LeaveType.Title}</div>

            <div className="leave-card-body">
              <div className="leave-metric">
                <span className="metric-label">Allowed</span>
                <span className="metric-value">{item.AllowedLeaves}</span>
              </div>

              <div className="leave-metric">
                <span className="metric-label">Remaining</span>
                <span className="metric-value highlight">
                  {item.RemainingLeaves}
                </span>
              </div>

              <div className="leave-metric">
                <span className="metric-label">Approved</span>
                <span className="metric-value muted">
                  {item.ApprovedLeaves}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
