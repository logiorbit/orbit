export default function StatusBadge({ status }) {
  const colorMap = {
    Pending: "yellow",
    "TL Approved": "blue",
    Approved: "green",
    Rejected: "red",
    WIP: "blue",
    Draft: "yellow",
    Complete: "green",
    "On Project": "green",
    "On Bench - On Target": "yellow",
    "Non Productive": "gray",
    "On Bench": "red",
    "In Training": "blue",
  };

  return (
    <span className={`status-badge ${colorMap[status] || "gray"}`}>
      {status}
    </span>
  );
}
