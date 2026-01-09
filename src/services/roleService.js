const normalizeEmail = (email) => email?.toLowerCase()?.trim();

const getPersonEmail = (person) => {
  if (!person) return null;
  return normalizeEmail(person.EMail || person.Email);
};

export function resolveUserRoles({
  loggedInEmail,
  employeeHierarchy = [],
  leadershipList = [],
}) {
  const email = normalizeEmail(loggedInEmail);

  const roles = {
    isEmployee: false,
    isTL: false,
    isManager: false,
    isLeadership: false,
  };

  if (!email) return roles;

  // Employee
  roles.isEmployee = employeeHierarchy.some(
    (item) => getPersonEmail(item.Employee) === email
  );

  // TL / ATL
  roles.isTL = employeeHierarchy.some(
    (item) =>
      getPersonEmail(item.TL) === email ||
      getPersonEmail(item.ATL) === email ||
      getPersonEmail(item.GTL) === email
  );

  // Manager
  roles.isManager = employeeHierarchy.some(
    (item) => getPersonEmail(item.Manager) === email
  );

  // Leadership (robust)
  roles.isLeadership = leadershipList.some((item) => {
    // Try common field names safely
    return (
      getPersonEmail(item.Leader) === email ||
      getPersonEmail(item.Leadership) === email ||
      getPersonEmail(item.LeadershipUser) === email
    );
  });

  return roles;
}
