import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../auth/msalConfig";

export default function Login() {
  const { instance } = useMsal();

  return (
    <div className="login-page">
      <button onClick={() => instance.loginRedirect(loginRequest)}>
        Sign in with Microsoft
      </button>
    </div>
  );
}
