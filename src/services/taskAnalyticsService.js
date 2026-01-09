const DAILY_CAPACITY = 9;
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7; // Sunday fix
  if (day !== 1) d.setDate(d.getDate() - day + 1);
  return startOfDay(d);
}

function startOfMonth(date) {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}
function resolveTimeWindow(period) {
  const today = new Date();

  switch (period) {
    case "TODAY":
      return {
        from: startOfDay(today),
        to: endOfDay(today),
      };

    case "WEEK":
      return {
        from: startOfWeek(today),
        to: endOfDay(today),
      };

    case "MONTH":
      return {
        from: startOfMonth(today),
        to: endOfDay(today),
      };

    default:
      throw new Error("Invalid period");
  }
}
function filterTasksByDate(tasks, from, to) {
  return tasks.filter((t) => {
    const taskDate = new Date(t.TaskDate);
    return taskDate >= from && taskDate <= to;
  });
}
function calculateKPIs(tasks, peopleCount = 1) {
  const allocated = tasks.reduce(
    (sum, t) => sum + Number(t.EstimatedHours || 0),
    0
  );

  const productive = tasks.reduce(
    (sum, t) => sum + Number(t.ProductiveHours || 0),
    0
  );

  const billable = tasks
    .filter((t) => t.Status === "Complete")
    .reduce((sum, t) => sum + Number(t.BillableHours || 0), 0);

  const capacity = DAILY_CAPACITY * peopleCount;

  return {
    allocated,
    billable,
    productive,
    capacity,
    allocatedPct: capacity ? Math.round((allocated / capacity) * 100) : 0,
    billablePct: capacity ? Math.round((billable / capacity) * 100) : 0,
    productivePct: capacity ? Math.round((productive / capacity) * 100) : 0,
  };
}
export function getTaskKPIs({ tasks, period, peopleCount = 1 }) {
  const { from, to } = resolveTimeWindow(period);

  const filteredTasks = filterTasksByDate(tasks, from, to);

  return calculateKPIs(filteredTasks, peopleCount);
}
export function getGroupedTaskKPIs({ tasks, period, groupByFn }) {
  const { from, to } = resolveTimeWindow(period);

  const filtered = filterTasksByDate(tasks, from, to);

  const map = {};

  filtered.forEach((task) => {
    const key = groupByFn(task);
    if (!map[key]) map[key] = [];
    map[key].push(task);
  });

  const result = {};

  Object.keys(map).forEach((key) => {
    result[key] = calculateKPIs(map[key], 1);
  });

  return result;
}
