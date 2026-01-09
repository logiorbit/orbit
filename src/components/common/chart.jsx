import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function ChartComponent({ type = "line", data }) {
  // Absolute safety guard
  if (!data || !Array.isArray(data.labels)) {
    return (
      <div className="muted" style={{ padding: 20 }}>
        No chart data available
      </div>
    );
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  switch (type) {
    case "bar":
      return <Bar data={data} options={commonOptions} />;

    case "pie":
      return <Pie data={data} options={commonOptions} />;

    case "donut":
    case "doughnut":
      return <Doughnut data={data} options={commonOptions} />;

    case "line":
    default:
      return <Line data={data} options={commonOptions} />;
  }
}
