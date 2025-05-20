"use client";
import { useEffect, useState } from "react";
import Card from "@/components/Card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type DailyStat = { date: string; duration: number; calories: number };

type DashboardData = {
  thisWeek: {
    totalCalories: number;
    avgDailyCalories: number;
    totalDuration: number;
    daysWithActivity: number;
    daily: DailyStat[];
  };
  lastWeek: {
    daily: DailyStat[];
  };
};

function getBufferedMax(values: number[]) {
  const max = Math.max(...values, 1);
  const buffered = Math.ceil((max * 1.25) / 5) * 5;
  return buffered;
}

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfWeek(date: Date) {
  const start = getStartOfWeek(date);
  const d = new Date(start);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-2">
        <Card className="w-full max-w-2xl text-center">Loading...</Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-2">
        <Card className="w-full max-w-2xl text-center">No data available.</Card>
      </div>
    );
  }

  // Prepare chart data
  const labels = weekDays;
  const thisWeekDurations = data.thisWeek.daily.map((d) => d.duration);
  const thisWeekCalories = data.thisWeek.daily.map((d) => d.calories);
  const lastWeekDurations = data.lastWeek.daily.map((d) => d.duration);

  const maxMinutes = getBufferedMax([...thisWeekDurations, ...lastWeekDurations]);
  const maxCalories = getBufferedMax(thisWeekCalories);

  // Calculate week range for header
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);
  const weekRange = `${startOfWeek.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${endOfWeek.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  const chartTabs = [
    {
      label: "Minutes per Day",
      content: (
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "Minutes",
                data: thisWeekDurations,
                borderColor: "#2563eb",
                backgroundColor: "#60a5fa",
                tension: 0.3,
                fill: true,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: maxMinutes } },
          }}
        />
      ),
    },
    {
      label: "Calories per Day",
      content: (
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Calories",
                data: thisWeekCalories,
                backgroundColor: "#22c55e",
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: maxCalories } },
          }}
        />
      ),
    },
    {
      label: "Compare to Last Week",
      content: (
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "This Week",
                data: thisWeekDurations,
                backgroundColor: "#2563eb",
              },
              {
                label: "Last Week",
                data: lastWeekDurations,
                backgroundColor: "#f59e42",
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
            scales: { y: { beginAtZero: true, max: maxMinutes } },
          }}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2">
      <Card className="w-full max-w-2xl mb-6">
        <h1 className="text-2xl font-bold mb-1">Weekly Dashboard</h1>
        <div className="text-gray-500 text-sm mb-4">Week of {weekRange}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700">{data.thisWeek.totalCalories}</div>
            <div className="text-gray-600 text-sm">Total Calories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-700">{data.thisWeek.avgDailyCalories}</div>
            <div className="text-gray-600 text-sm">Avg Daily Calories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-700">{data.thisWeek.totalDuration}</div>
            <div className="text-gray-600 text-sm">Total Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-700">{data.thisWeek.daysWithActivity}/7</div>
            <div className="text-gray-600 text-sm">Days with Activity</div>
          </div>
        </div>
        <div className="mb-4 flex gap-2 justify-center">
          {chartTabs.map((tabObj, i) => (
            <button
              key={tabObj.label}
              className={`px-4 py-2 rounded-t font-semibold border-b-2 transition-colors ${tab === i ? "border-blue-600 text-blue-700 bg-blue-50" : "border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200"}`}
              onClick={() => setTab(i)}
            >
              {tabObj.label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-b shadow p-4">
          {chartTabs[tab].content}
        </div>
      </Card>
    </div>
  );
} 