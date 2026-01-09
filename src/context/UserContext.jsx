import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userRoles, setUserRoles] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [employeeHierarchy, setEmployeeHierarchy] = useState(null);

  return (
    <UserContext.Provider
      value={{
        userRoles,
        setUserRoles,
        userProfile,
        setUserProfile,
        employeeHierarchy,
        setEmployeeHierarchy,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
