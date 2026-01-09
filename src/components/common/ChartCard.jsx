import { Line, Bar, Doughnut } from "react-chartjs-2";
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

import ChartComponent from "./chart";
import { emptyLineChart } from "../../utils/defaultChartData";

export default function ChartCard({ title, type, data }) {
  const safeData = data?.labels ? data : emptyLineChart;

  return (
    <div className="card">
      <h3>{title}</h3>
      <ChartComponent type={type} data={safeData} />
    </div>
  );
}
