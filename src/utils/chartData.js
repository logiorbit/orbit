export const leaveTrendData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      data: [4, 6, 3, 5, 2, 4],
      borderColor: "#22c55e",
      backgroundColor: "rgba(34,197,94,0.15)",
      tension: 0.4,
      fill: true,
    },
  ],
};

export const leaveTypeSplit = {
  labels: ["PTO", "WFH", "CompOff", "Other"],
  datasets: [
    {
      data: [45, 30, 15, 10],
      backgroundColor: ["#22c55e", "#86efac", "#bbf7d0", "#dcfce7"],
    },
  ],
};

export const teamUtilizationData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [
    {
      data: [6.5, 7.2, 8, 7.8, 6.9],
      backgroundColor: "#22c55e",
    },
  ],
};
