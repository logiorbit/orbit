export function calculateEmployeeTodayKpis(tasks = []) {
  let allocated = 0;
  let billable = 0;

  tasks.forEach((task) => {
    // Allocated = Estimated Hours
    allocated += Number(task.EstimatedHours || 0);

    // Billable = BillableHours if present (>0)
    const billableHours = Number(task.BillableHours || 0);
    if (billableHours > 0) {
      billable += billableHours;
    }
  });

  return {
    allocated,
    billable,
    capacity: 9,
    utilization: ((allocated / 9) * 100).toFixed(0),
  };
}
