import axios from "axios";

const SITE_URL = "https://logivention.sharepoint.com/sites/LogiOrbit";

//console.log("sharePointService.js LOADED");

export async function getEmployeeHierarchy(accessToken) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Employee_Hierarchy')/items` +
    `?$select=` +
    `Id,Status,TotalExp,RelevantExp,LegalName,PersonalEmail,Position,Mobile,` +
    `Employee/Id,Employee/Title,Employee/EMail,` +
    `TL/EMail,ATL/EMail,GTL/EMail,Manager/EMail,` +
    `PrimarySkillsId,SecondarySkillsId,PastClientsId,CurrentClient/Title` +
    `&$expand=Employee,TL,ATL,GTL,Manager,CurrentClient`;
  //
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=minimalmetadata",
    },
  });

  //console.log(response.data.value);

  return response.data.value;
}

export async function getLeadershipConfig(accessToken) {
  // console.log("getLeadershipConfig CALLED");
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Leadership_Config')/items` +
    `?$select=Leader/EMail&$expand=Leader`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  // console.log("sharePointService.js LOADED");
  // console.log("Leadership RAW ITEM:", response.data.value[0]);

  return response.data.value;
}

export async function getLeaveEntitlements(accessToken, employeeEmail, year) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Leave_Entitlement')/items` +
    `?$select=LeaveType/Title,AllowedLeaves,ApprovedLeaves,RemainingLeaves,Year` +
    `&$expand=LeaveType` +
    `&$filter=Year eq ${year} and Employee/EMail eq '${employeeEmail}'`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return response.data.value;
}

export async function getMyLeaves(accessToken, employeeEmail) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Leave_Requests')/items` +
    `?$select=Id,Reason,LeaveType/Title,StartDate,EndDate,NoofDays,Status,Created,Employee/EMail` +
    `&$expand=LeaveType,Employee` +
    `&$filter=Employee/EMail eq '${employeeEmail}'` +
    `&$orderby=Created desc`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return response.data.value;
}

export async function submitLeaveRequest(accessToken, data) {
  // 1️⃣ Resolve IDs
  const user = await getCurrentUser(accessToken);
  const leaveTypeId = await getLeaveTypeId(accessToken, data.leaveType);

  if (!leaveTypeId) {
    throw new Error("Invalid Leave Type selected");
  }

  // 2️⃣ Build payload using INTERNAL names
  const payload = {
    LeaveTypeId: leaveTypeId, // Lookup → Id
    StartDate: data.startDate,
    EndDate: data.endDate,
    NoofDays: data.days,
    Reason: data.reason,
    Status: "Pending",
    EmployeeId: user.Id, // Person → Id
  };

  const url = `${SITE_URL}/_api/web/lists/getbytitle('Leave_Requests')/items`;

  await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
      "Content-Type": "application/json",
    },
  });
}

export async function getCurrentUser(accessToken) {
  const url = `${SITE_URL}/_api/web/currentuser`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return res.data; // contains Id
}

export async function getLeaveTypeId(accessToken, leaveTypeName) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Leave_Types')/items` +
    `?$select=Id,Title`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  //console.log("Leave Types from SP:", res.data.value);
  // console.log("Requested Leave Type:", leaveTypeName);

  const match = res.data.value.find(
    (lt) => lt.Title.trim() === leaveTypeName.trim(),
  );

  return match?.Id;
}

export async function getHolidays(accessToken, year) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Holiday_Master')/items` +
    `?$select=HolidayDate,Year` +
    `&$filter=Year eq ${year}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return response.data.value.map((h) => new Date(h.HolidayDate).toDateString());
}

export async function getHolidaysForYear(accessToken, year) {
  const SITE_URL = "https://logivention.sharepoint.com/sites/LogiOrbit";

  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Holiday_Master')/items` +
    `?$select=Title,HolidayDate,Day,Description,Year` +
    `&$filter=Year eq ${year}` +
    `&$orderby=HolidayDate asc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  const data = await res.json();
  return data.value;
}

export async function getLeavesForTLApproval(accessToken) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Leave_Requests')/items` +
    `?$select=Id,Status,StartDate,EndDate,NoofDays,Reason,` +
    `Employee/Id,Employee/Title,Employee/EMail,` +
    `LeaveType/Id,LeaveType/Title` +
    `&$expand=Employee,LeaveType` +
    `&$filter=Status eq 'Pending'`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return res.data.value;
}

export async function getLeavesForManagerApproval(accessToken) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Leave_Requests')/items` +
    `?$select=` +
    `Id,Status,StartDate,EndDate,NoofDays,Reason,` +
    `Employee/Id,Employee/Title,Employee/EMail,` +
    `LeaveType/Id,LeaveType/Title` +
    `&$expand=Employee,LeaveType` +
    `&$filter=Status eq 'TL Approved'`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  // console.log(response);

  return response.data.value;
}

export async function updateLeaveStatus(accessToken, leaveId, payload) {
  const url = `${SITE_URL}/_api/web/lists/getbytitle('Leave_Requests')/items(${leaveId})`;

  await axios.patch(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
      "Content-Type": "application/json",
      "IF-MATCH": "*",
    },
  });
}

export async function getLeaveEntitlementRecord(
  accessToken,
  employeeId,
  leaveTypeId,
  year,
) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Leave_Entitlement')/items` +
    `?$select=` +
    `Id,AllowedLeaves,ApprovedLeaves,RemainingLeaves,Year,` +
    `Employee/Id,LeaveType/Id` +
    `&$expand=Employee,LeaveType` +
    `&$filter=` +
    `Employee/Id eq ${employeeId} and ` +
    `LeaveType/Id eq ${leaveTypeId} and ` +
    `Year eq ${year}`; // 👈 STRING FILTER

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return res.data.value[0];
}

export async function updateLeaveEntitlement(
  accessToken,
  entitlementId,
  payload,
) {
  const url = `${SITE_URL}/_api/web/lists/getbytitle('Leave_Entitlement')/items(${entitlementId})`;

  await axios.patch(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
      "Content-Type": "application/json",
      "IF-MATCH": "*",
    },
  });
}

export async function finalizeLeaveApproval(accessToken, leave) {
  const year = new Date(leave.StartDate).getFullYear();

  // 1️⃣ Load entitlement
  const entitlement = await getLeaveEntitlementRecord(
    accessToken,
    leave.Employee.Id,
    leave.LeaveType.Id,
    year,
  );

  if (!entitlement) {
    throw new Error("Leave entitlement not found");
  }

  const newApproved = (entitlement.ApprovedLeaves || 0) + leave.NoofDays;

  const newRemaining = entitlement.AllowedLeaves - newApproved;

  // 2️⃣ Update entitlement
  await updateLeaveEntitlement(accessToken, entitlement.Id, {
    ApprovedLeaves: newApproved,
    RemainingLeaves: newRemaining,
  });

  // 3️⃣ Mark leave as Approved
  await updateLeaveStatus(accessToken, leave.Id, {
    Status: "Approved",
  });
}

/* -------- CONFIG DATA -------- */

export async function getClients(accessToken) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Client_Master')/items` +
    `?$select=Id,Title&$filter=IsActive eq 1`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return (await res.json()).value;
}

export async function getSkills(accessToken) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Skills')/items` +
    `?$select=Id,Title`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return (await res.json()).value;
}

export async function getTaskTypes(accessToken) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Task_Types')/items` +
    `?$select=Id,Title,IsBillable`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return (await res.json()).value;
}

/* -------- EMPLOYEE TASKS -------- */

export async function getMyTasks(accessToken, email, date) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items` +
    `?$select=Id,Title,TaskDate,EstimatedHours,BillableHours,ProductiveHours,Status,Client/Title,TaskType/Title` +
    `&$expand=Client,TaskType` +
    `&$filter=Employee/EMail eq '${email}' and TaskDate eq '${date}'`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return (await res.json()).value;
}

export async function createTask(accessToken, payload) {
  const url = `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items`;

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getMyTasksForToday(accessToken, employeeId) {
  const SITE_URL = "https://logivention.sharepoint.com/sites/LogiOrbit";

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const startISO = start.toISOString();
  const endISO = end.toISOString();

  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items` +
    `?$select=EstimatedHours,BillableHours,ProductiveHours,Status,TaskDate` +
    `&$filter=Employee/Id eq ${employeeId}` +
    ` and TaskDate ge datetime'${startISO}'` +
    ` and TaskDate le datetime'${endISO}'`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  const data = await res.json();
  return data.value || [];
}

export async function getMyTasksForDate(token, employeeId, selectedDate) {
  if (!employeeId) {
    console.warn("getMyTasksForDate: employeeId missing");
    return [];
  }

  // ✅ Fallback to today if date is invalid or missing
  let baseDate;

  if (selectedDate) {
    baseDate = new Date(selectedDate);
  }

  if (!baseDate || isNaN(baseDate.getTime())) {
    baseDate = new Date(); // today
  }

  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items` +
    `?$select=` +
    `Id,Title,TaskDate,Status,EstimatedHours,ProductiveHours,BillableHours,` +
    `Client/Id,Client/Title,` +
    `TaskType/Id,TaskType/Title,` +
    `Employee/Id` +
    `&$expand=Client,TaskType,Employee` +
    `&$filter=Employee/Id eq ${employeeId} ` +
    `and TaskDate ge datetime'${start.toISOString()}' ` +
    `and TaskDate le datetime'${end.toISOString()}'`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return response.data.value || [];
}

export async function deleteTask(token, taskId) {
  const url = `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items(${taskId})`;

  await axios.delete(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "IF-MATCH": "*",
    },
  });
}

export async function updateTask(token, taskId, payload) {
  const url = `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items(${taskId})`;

  await axios.patch(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "IF-MATCH": "*",
      "Content-Type": "application/json",
    },
  });
}

export async function updateLeave(token, id, payload) {
  const url = `${SITE_URL}/_api/web/lists/getbytitle('Leave_Requests')/items(${id})`;

  await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-HTTP-Method": "MERGE",
      "IF-MATCH": "*",
      Accept: "application/json;odata=nometadata",
    },
  });
}

export async function updateLeaveRequest(accessToken, leaveId, payload) {
  const url = `${SITE_URL}/_api/web/lists/getbytitle('Leave_Requests')/items(${leaveId})`;

  await axios.patch(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
      "Content-Type": "application/json",
      "IF-MATCH": "*",
      "X-HTTP-Method": "MERGE",
    },
  });
}

export async function deleteLeave(token, id) {
  const url = `${SITE_URL}/_api/web/lists/getbytitle('Leave_Requests')/items(${id})`;

  await axios.post(url, null, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-HTTP-Method": "DELETE",
      "IF-MATCH": "*",
      Accept: "application/json;odata=nometadata",
    },
  });
}

export function getTeamMembers(hierarchy, tlEmail) {
  return hierarchy
    .filter(
      (h) =>
        h.TL?.EMail?.toLowerCase() === tlEmail.toLowerCase() ||
        h.ATL?.EMail?.toLowerCase() === tlEmail.toLowerCase() ||
        h.GTL?.EMail?.toLowerCase() === tlEmail.toLowerCase(),
    )
    .map((h) => h.Employee);
}

export async function getTeamTasksForPeriod(token, period, members) {
  if (!members || members.length === 0) {
    return { estimated: 0, billed: 0, productive: 0 };
  }

  let start;
  let end;
  const now = new Date();

  if (period === "today") {
    start = new Date(now.setHours(0, 0, 0, 0));
    end = new Date(now.setHours(23, 59, 59, 999));
  }

  if (period === "week") {
    const first = now.getDate() - now.getDay();
    start = new Date(now.setDate(first));
    start.setHours(0, 0, 0, 0);

    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  }

  if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }
  ////console.log("The members are", members);
  const employeeIds = members.map((m) => (m.Employee ? m.Employee.Id : m.Id));
  //console.log("The Emoployeeids are", employeeIds);
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items` +
    `?$select=EstimatedHours,BillableHours,ProductiveHours,Employee/Id,TaskDate` +
    `&$expand=Employee` +
    `&$filter=TaskDate ge datetime'${start.toISOString()}' ` +
    `and TaskDate le datetime'${end.toISOString()}'`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  const rows = res.data.value || [];

  // console.log(rows);

  let estimated = 0;
  let billed = 0;
  let productive = 0;

  rows.forEach((t) => {
    if (employeeIds.includes(t.Employee?.Id)) {
      estimated += Number(t.EstimatedHours || 0);
      billed += Number(t.BillableHours || 0);
      productive += Number(t.ProductiveHours || 0);
    }
  });

  return { estimated, billed, productive };
}

export async function getAllTasksForPeriod(token, period) {
  let start;
  let end;
  const now = new Date();

  if (period === "today") {
    start = new Date(now.setHours(0, 0, 0, 0));
    end = new Date(now.setHours(23, 59, 59, 999));
  }

  if (period === "week") {
    const first = now.getDate() - now.getDay();
    start = new Date(now.setDate(first));
    start.setHours(0, 0, 0, 0);

    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  }

  if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items` +
    `?$select=EstimatedHours,BillableHours,ProductiveHours,Employee/Id,TaskDate` +
    `&$expand=Employee` +
    `&$filter=TaskDate ge datetime'${start.toISOString()}' ` +
    `and TaskDate le datetime'${end.toISOString()}'`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  const rows = res.data.value || [];

  // console.log(rows);

  let estimated = 0;
  let billed = 0;
  let productive = 0;

  rows.forEach((t) => {
    estimated += Number(t.EstimatedHours || 0);
    billed += Number(t.BillableHours || 0);
    productive += Number(t.ProductiveHours || 0);
  });

  return { estimated, billed, productive };
}

export async function getLeavesForDate(accessToken, date) {
  const start = `${date}T00:00:00Z`;
  const end = `${date}T23:59:59Z`;

  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Leave_Requests')/items` +
    `?$select=Id,StartDate,EndDate,Status,Employee/Title,Employee/EMail,LeaveType/Title` +
    `&$expand=Employee,LeaveType` +
    `&$filter=StartDate le datetime'${end}' and EndDate ge datetime'${start}'`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return res.data.value;
}

export async function getTasksForDate(accessToken, date) {
  const start = `${date}T00:00:00Z`;
  const end = `${date}T23:59:59Z`;

  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items` +
    `?$select=Id,Status,EstimatedHours,ProductiveHours,BillableHours,
        Employee/Title,Employee/EMail,
        TaskType/Title,
        Client/Id,Client/Title` +
    `&$expand=Employee,TaskType,Client` +
    `&$filter=TaskDate ge datetime'${start}' and TaskDate le datetime'${end}'`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return res.data.value;
}

export async function getTasksForMonth(accessToken, month, year) {
  const start = new Date(year, month - 1, 1).toISOString();
  const end = new Date(year, month, 0, 23, 59, 59).toISOString();

  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items` +
    `?$select=TaskDate,BillableHours,ProductiveHours,Employee/Title,Employee/EMail` +
    `&$expand=Employee` +
    `&$filter=TaskDate ge datetime'${start}' and TaskDate le datetime'${end}'`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return res.data.value;
}

export function getManagerTeamMembers(hierarchy, managerEmail) {
  return hierarchy.filter(
    (h) => h.Manager?.EMail?.toLowerCase() === managerEmail.toLowerCase(),
  );
}

export function getAllTeamMembers(hierarchy, managerEmail) {
  return hierarchy;
}

export function getSelfMembers(hierarchy, managerEmail) {
  return hierarchy.filter(
    (h) => h.Employee?.EMail?.toLowerCase() === managerEmail.toLowerCase(),
  );
}

export async function getTasksByClientAndDate(accessToken, clientId, date) {
  if (!clientId || !date) {
    console.warn("getTasksByClientAndDate: missing clientId or date");
    return [];
  }

  const baseDate = new Date(date);

  if (isNaN(baseDate.getTime())) {
    console.warn("getTasksByClientAndDate: invalid date", date);
    return [];
  }

  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items` +
    `?$select=` +
    `Id,Title,TaskDate,Status,EstimatedHours,BillableHours,ProductiveHours,` +
    `Employee/Id,Employee/Title,Employee/EMail,` +
    `Client/Id,Client/Title,` +
    `TaskType/Id,TaskType/Title` +
    `&$expand=Employee,Client,TaskType` +
    `&$filter=` +
    `Client/Id eq ${clientId} ` +
    `and TaskDate ge datetime'${start.toISOString()}' ` +
    `and TaskDate le datetime'${end.toISOString()}'`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return res.data.value || [];
}

export async function getTasksForDate2(accessToken, date) {
  if (!date) {
    console.warn("getTasksForDate: missing date");
    return [];
  }

  const baseDate = new Date(date);

  if (isNaN(baseDate.getTime())) {
    console.warn("getTasksForDate: invalid date", date);
    return [];
  }

  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Task_Records')/items` +
    `?$select=` +
    `Id,Title,TaskDate,Status,EstimatedHours,BillableHours,ProductiveHours,` +
    `Employee/Id,Employee/Title,Employee/EMail,` +
    `Client/Id,Client/Title,` +
    `TaskType/Id,TaskType/Title` +
    `&$expand=Employee,Client,TaskType` +
    `&$filter=` +
    `and TaskDate ge datetime'${start.toISOString()}' ` +
    `and TaskDate le datetime'${end.toISOString()}'`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  console.log(res.data.value);

  return res.data.value;
}

export async function getMyEmployeeHierarchyRecord(accessToken, email) {
  const encodedEmail = encodeURIComponent(email);

  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Employee_Hierarchy')/items` +
    `?$select=` +
    `Id,` +
    `Employee/Title,Employee/EMail,` +
    `ATL/Title,TL/Title,Manager/Title,GTL/Title,` +
    `IsActive,` +
    `Status,Position,` +
    `TotalExp,` +
    `RelevantExp,` +
    `LegalName,` +
    `PersonalEmail,` +
    `Mobile,` +
    `PrimarySkills/Id,PrimarySkills/Title,` +
    `SecondarySkills/Id,SecondarySkills/Title,` +
    `CurrentClient/Id,CurrentClient/Title,` +
    `PastClients/Id,PastClients/Title,` +
    `EndClients` +
    `&$expand=` +
    `Employee,ATL,TL,GTL,Manager,` +
    `PrimarySkills,SecondarySkills,` +
    `CurrentClient,PastClients` +
    `&$filter=Employee/EMail eq '${encodedEmail}'`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return res.data.value[0];
}
/*
export async function updateEmployeeHierarchy(token, itemId, payload) {
  return axios.patch(
    `https://logivention.sharepoint.com/sites/LogiOrbit/_api/web/lists/getbytitle('Employee_Hierarchy')/items(${itemId})`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=nometadata",
        "Content-Type": "application/json;odata=nometadata",
        "IF-MATCH": "*",
      },
    }
  );
} 

export async function updateEmployeeHierarchy(token, itemId, payload) {
  return axios.patch(
    `https://logivention.sharepoint.com/sites/LogiOrbit/_api/web/lists/getbytitle('Employee_Hierarchy')/items(${itemId})`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=nometadata",
        "Content-Type": "application/json;odata=nometadata",
        "IF-MATCH": "*",
        "X-HTTP-Method": "MERGE", // 👈 CRITICAL for updates
      },
    }
  );
} */

/*
export async function updateEmployeeHierarchy(token, itemId, payload) {
  return axios.patch(
    `https://graph.microsoft.com/v1.0/sites/logivention.sharepoint.com:/sites/LogiOrbit:/lists/'Employee_Hierarchy'/items/${itemId}/fields`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
}
*/

export async function updateEmployeeHierarchy(token, itemId, payload) {
  return axios.patch(
    `https://logivention.sharepoint.com/sites/LogiOrbit/_api/web/lists/getbytitle('Employee_Hierarchy')/items(${itemId})`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=nometadata",
        "Content-Type": "application/json;odata=nometadata",
        "IF-MATCH": "*",
        "X-HTTP-Method": "MERGE",
      },
    },
  );
}

/* ===============================
   CREATE TIMESHEET ITEM
   =============================== */
export async function submitTimesheet(accessToken, data) {
  const user = await getCurrentUser(accessToken);

  const payload = {
    Title: data.title,
    ClientId: data.cliendId,
    Month: data.month,
    Year: data.year,
    TotalWorkingDays: data.totalWorkingDays,
    TotalLeaves: data.totalLeaves,
    TotalHolidays: data.totalHolidays,
    LeaveDates: data.leaveDates,
    HolidayDates: data.holidayDates,
    TotalBillingDays: data.totalBillingDays,
    TotalBillingHours: data.totalBillingHours,
    Status: data.status, // MUST MATCH CHOICE
    EmployeeId: user.Id, // Person field
  };

  const res = await axios.post(
    `${SITE_URL}/_api/web/lists/getbytitle('Timesheets')/items`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json;odata=nometadata",
        "Content-Type": "application/json",
      },
    },
  );

  return res.data.Id; // needed for attachments
}

/* =========================
   UPLOAD ATTACHMENTS
   ========================= */
export async function uploadTimesheetAttachments(accessToken, itemId, files) {
  for (const file of files) {
    const url = `${SITE_URL}/_api/web/lists/getbytitle('Timesheets')/items(${itemId})/AttachmentFiles/add(FileName='${file.name}')`;

    await axios.post(url, file, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json;odata=nometadata",
        "Content-Type": file.type,
      },
    });
  }
}

export async function getTimesheetsForMonth(accessToken, month, year) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Timesheets')/items` +
    `?$select=` +
    [
      "Id",
      "Month",
      "Year",
      "Status",
      "TotalWorkingDays",
      "TotalLeaves",
      "LeaveDates",
      "TotalHolidays",
      "HolidayDates",
      "TotalBillingDays",
      "TotalBillingHours",
      "Client/Id",
      "Client/Title",
      "Employee/Id",
      "Employee/EMail",
      "Employee/Title",
    ].join(",") +
    `&$expand=Client,Employee` +
    `&$filter=Month eq '${month}' and Year eq ${year}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  return response.data.value;
}

export async function updateTimesheetRecord(token, id, payload) {
  return fetch(
    `${SITE_URL}/_api/web/lists/getbytitle('Timesheets')/items(${id})`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json;odata=nometadata",
        "IF-MATCH": "*",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteTimesheetRecord(token, id) {
  return fetch(
    `${SITE_URL}/_api/web/lists/getbytitle('Timesheets')/items(${id})`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "IF-MATCH": "*",
      },
    },
  );
}

export async function getTimesheetAttachments(token, id) {
  const res = await fetch(
    `${SITE_URL}/_api/web/lists/getbytitle('Timesheets')/items(${id})/AttachmentFiles`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // Add this line to force JSON response
        Accept: "application/json;odata=nometadata",
      },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("SharePoint Error Response:", errorText);
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const json = await res.json();
  return json.value; // SharePoint returns the array inside .value [cite: 195]
}

export async function getInvoicesByMonthYear(token, month, year) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Invoice_Header')/items` +
    `?$select=` +
    `ID,InvoiceID,InvoiceMonth,InvoiceYear,InvoiceStatus,` +
    `SubTotal,GrandTotal,IsLocked,PDFUrl,` +
    `Client/Id,Client/ClientName` +
    `&$expand=Client` +
    `&$filter=InvoiceMonth eq '${month}' and InvoiceYear eq '${year}'`;

  console.log(url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Invoice fetch failed:", text);
    throw new Error("Failed to fetch invoices");
  }

  const data = await response.json();
  return data.value || [];
}

export async function getApprovedTimesheetsByClient(token, clientId) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Timesheets')/items` +
    `?$select=` +
    `ID,Month,Year,TotalBillingHours,TotalBillingDays,Status,IsInvoiced,` +
    `Employee/Title,Employee/Id,Client/Id` +
    `&$expand=Employee,Client` +
    `&$filter=` +
    `Client/Id eq ${clientId}` +
    ` and Status eq 'HR Approved'` +
    ` and (IsInvoiced eq false or IsInvoiced eq null)`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Timesheet fetch failed:", text);
    throw new Error("Failed to fetch approved timesheets");
  }

  const data = await response.json();
  return data.value || [];
}

export async function createInvoiceHeader(token, payload) {
  const response = await fetch(
    `${SITE_URL}/_api/web/lists/getbytitle('Invoice_Header')/items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json;odata=nometadata",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("createInvoiceHeader failed:", text);
    throw new Error(text);
  }

  // Fetch the latest created invoice (safe approach)
  const location = response.headers.get("Location");
  if (location) {
    const idMatch = location.match(/\((\d+)\)$/);
    if (idMatch) {
      return { ID: Number(idMatch[1]) };
    }
  }

  throw new Error("Invoice created but ID not returned");
}

export async function createInvoiceTimesheetMap(token, payload) {
  const response = await fetch(
    `${SITE_URL}/_api/web/lists/getbytitle('Invoice_Timesheet_Map')/items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json;odata=nometadata",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  return response.json();
}

export async function markTimesheetInvoiced(token, id, invoiceId) {
  return fetch(
    `${SITE_URL}/_api/web/lists/getbytitle('Timesheets')/items(${id})`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json;odata=nometadata",
        "IF-MATCH": "*",
      },
      body: JSON.stringify({
        IsInvoiced: true,
        InvoiceId: invoiceId,
      }),
    },
  );
}

export async function getEmployeeClientAssignment(token, employeeId, clientId) {
  const url =
    `${SITE_URL}/_api/web/lists/getbytitle('Employee_Client_Assignment')/items` +
    `?$select=ID,RateType,RateValue` +
    `&$filter=Employee/Id eq ${employeeId} and Client/Id eq ${clientId} and Active eq true` +
    `&$expand=Employee,Client`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json;odata=nometadata",
    },
  });

  const data = await res.json();
  return data.value?.[0]; // assume one active assignment
}
