import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";

import Login from "./components/auth/Login";
import Dashboard from "./components/common/Dashboard";
import UserInitializer from "./context/UserInitializer";

export default function App() {
  return (
    <>
      <AuthenticatedTemplate>
        <UserInitializer>
          <Dashboard />
        </UserInitializer>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Login />
      </UnauthenticatedTemplate>
    </>
  );
}
