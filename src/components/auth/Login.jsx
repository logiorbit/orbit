import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../auth/msalConfig";
import "./landing.css";

export default function Login() {
  const { instance } = useMsal();

  const signIn = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div className="landing-container">
      <div className="landing-content">
        {/* LEFT CONTENT */}
        <div className="landing-text">
          <h1>
            Logi<span>Orbit</span>
          </h1>

          <p>
            LogiOrbit is a modern workforce intelligence platform designed to
            bring clarity, accountability, and visibility into how teams work
            every day.
          </p>

          <p>
            Track tasks, manage leaves, monitor productivity, and analyze
            billable performance — all in one unified system.
          </p>

          <p>
            Built for Employees, Team Leads, Managers, and Leadership, LogiOrbit
            enables data-driven decisions with real-time insights across the
            organization.
          </p>

          <p>Simplify operations. Improve utilization. Lead with confidence.</p>

          <button className="ms-login-btn" onClick={signIn}>
            Sign in with Microsoft
          </button>
        </div>

        {/* RIGHT IMAGE */}
        <div className="landing-image">
          <img src="/landing-hero.png.jpg" alt="LogiOrbit Workforce Preview" />
        </div>
      </div>
    </div>
  );
}
