export function calculateRoles(employeeHierarchy, leadershipList, userEmail) {
  const email = userEmail.toLowerCase();

  let isEmployee = false;
  let isTL = false;
  let isManager = false;
  let isLeadership = false;
  let isHR = false;

  // Employee / TL / ATL / Manager roles
  employeeHierarchy.forEach((h) => {
    if (h.Employee?.EMail?.toLowerCase() === email) {
      isEmployee = true;
    }

    if (h.TL?.EMail?.toLowerCase() === email) {
      isTL = true;
    }

    if (h.ATL?.EMail?.toLowerCase() === email) {
      isTL = true;
    }

    if (h.GTL?.EMail?.toLowerCase() === email) {
      isTL = true;
    }

    if (h.Manager?.EMail?.toLowerCase() === email) {
      isManager = true;
    }
  });

  // Leadership role
  leadershipList.forEach((l) => {
    if (l.Leader?.EMail?.toLowerCase() === email) {
      isLeadership = true;
      isHR = true;
    }
  });

  if (email === "kashmiram@logivention.in") {
    isHR = true;
  }

  return {
    isEmployee,
    isTL,
    isManager,
    isLeadership,
    isHR,
  };
}
