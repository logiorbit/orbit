export default function StatusBadge({ status }) {
  const colorMap = {
    Pending: "yellow",
    "TL Approved": "blue",
    Approved: "green",
    Rejected: "red",
    WIP: "blue",
    Draft: "yellow",
    Complete: "green",
  };

  return (
    <span className={`status-badge ${colorMap[status] || "gray"}`}>
      {status}
    </span>
  );
}
