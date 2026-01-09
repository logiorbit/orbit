export function buildBillingMatrix(tasks, team, month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const rows = team.map((member) => {
    const daily = Array(daysInMonth).fill(0);

    tasks.forEach((t) => {
      if (
        t.Employee?.EMail?.toLowerCase() ===
        member.Employee?.EMail?.toLowerCase()
      ) {
        const d = new Date(t.TaskDate).getDate();
        daily[d - 1] += t.BillableHours || 0;
      }
    });

    return {
      employee: member.Employee.Title,
      daily,
      total: daily.reduce((a, b) => a + b, 0),
    };
  });

  return { days, rows };
}
