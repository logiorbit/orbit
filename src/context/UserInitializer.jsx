import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useUserContext } from "./UserContext";
import { getAccessToken } from "../auth/authService";
import {
  getEmployeeHierarchy,
  getLeadershipConfig,
} from "../services/sharePointService";
import { calculateRoles } from "../utils/roleUtils";

export default function UserInitializer({ children }) {
  const { instance, accounts } = useMsal();

  const { setUserRoles, setUserProfile, setEmployeeHierarchy } =
    useUserContext();

  useEffect(() => {
    async function init() {
      if (!accounts || accounts.length === 0) return;

      const token = await getAccessToken(instance, accounts[0]);

      // 1️⃣ Logged-in user
      const email = accounts[0].username;
      setUserProfile({ email });

      // 2️⃣ Employee hierarchy
      const hierarchyData = await getEmployeeHierarchy(token);
      setEmployeeHierarchy(hierarchyData);

      // 3️⃣ Leadership list
      const leadership = await getLeadershipConfig(token);

      // 4️⃣ Roles
      const roles = calculateRoles(hierarchyData, leadership, email);
      setUserRoles(roles);
    }

    init();
  }, [accounts]);

  return children;
}
