export default function MonthYearFilter({
  month,
  year,
  onMonthChange,
  onYearChange,
}) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 2; y++) {
    years.push(y);
  }

  return (
    <div className="month-year-filter">
      <select
        value={month}
        onChange={(e) => onMonthChange(e.target.value)}
        className="filter-select"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="filter-select"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
