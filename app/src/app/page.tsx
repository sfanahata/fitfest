"use client";
import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Link from "next/link";
import Button from "@/components/Button";
import { Line, Bar } from "react-chartjs-2";
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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Activity {
  id: string;
  type: string;
  effort?: string | null;
  date: string;
  duration: number;
  distance?: number | null;
  notes?: string | null;
  calories?: number | null;
}

interface DailyStats {
  date: string;
  duration: number;
  calories: number;
  activities: number;
}

interface DashboardData {
  thisWeek: {
    totalCalories: number;
    avgDailyCalories: number;
    totalDuration: number;
    daysWithActivity: number;
    daily: DailyStats[];
  };
  lastWeek: {
    totalCalories: number;
    avgDailyCalories: number;
    totalDuration: number;
    daysWithActivity: number;
    daily: DailyStats[];
  };
}

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [activitiesRes, dashboardRes] = await Promise.all([
        fetch("/api/activities"),
        fetch("/api/dashboard"),
      ]);

      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        // Filter activities to this week only
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const thisWeekActivities = data.filter((activity: Activity) => 
          new Date(activity.date) >= startOfWeek
        );
        setActivities(thisWeekActivities);
      }

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setDashboardData(data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-4xl">Loading...</Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {/* Welcome Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Welcome to FitFest</h1>
        <p className="text-xl text-gray-600 mb-8 text-center">Your personal fitness journey starts here. Track, share, and achieve your fitness goals.</p>
        {/* Dashboard Section */}
        {dashboardData && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {dashboardData.thisWeek.daily.length > 0 && (
              <div className="text-gray-500 text-sm text-left mt-1">
                Week of {new Date(dashboardData.thisWeek.daily[0].date).toLocaleDateString()} – {new Date(dashboardData.thisWeek.daily[dashboardData.thisWeek.daily.length - 1].date).toLocaleDateString()}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{dashboardData.thisWeek.totalCalories}</div>
                <div className="text-gray-600 text-sm">Total Calories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{dashboardData.thisWeek.avgDailyCalories}</div>
                <div className="text-gray-600 text-sm">Avg Daily Calories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-400">{dashboardData.thisWeek.totalDuration}</div>
                <div className="text-gray-600 text-sm">Total Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">{dashboardData.thisWeek.daysWithActivity}/7</div>
                <div className="text-gray-600 text-sm">Days with Activity</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card>
                <h3 className="text-lg font-semibold mb-4">Weekly Activity Comparison</h3>
                <Bar
                  data={{
                    labels: ["This Week", "Last Week"],
                    datasets: [
                      {
                        label: "Total Calories",
                        data: [dashboardData.thisWeek.totalCalories, dashboardData.lastWeek.totalCalories],
                        backgroundColor: "rgba(34, 197, 94, 0.5)",
                        borderColor: "rgb(34, 197, 94)",
                        borderWidth: 1,
                      },
                      {
                        label: "Total Minutes",
                        data: [dashboardData.thisWeek.totalDuration, dashboardData.lastWeek.totalDuration],
                        backgroundColor: "rgba(59, 130, 246, 0.5)",
                        borderColor: "rgb(59, 130, 246)",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Daily Activity Trend</h3>
                <Line
                  data={{
                    labels: dashboardData.thisWeek.daily.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
                    datasets: [
                      {
                        label: "Calories Burned",
                        data: dashboardData.thisWeek.daily.map(d => d.calories),
                        fill: true,
                        backgroundColor: "rgba(34, 197, 94, 0.15)",
                        borderColor: "rgb(34, 197, 94)",
                        tension: 0.4,
                        yAxisID: 'y1',
                      },
                      {
                        label: "Duration (minutes)",
                        data: dashboardData.thisWeek.daily.map(d => d.duration),
                        fill: true,
                        backgroundColor: "rgba(59, 130, 246, 0.15)",
                        borderColor: "rgb(59, 130, 246)",
                        tension: 0.4,
                        yAxisID: 'y2',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      },
                    },
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    scales: {
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'Calories',
                        },
                        beginAtZero: true,
                        grid: {
                          drawOnChartArea: true,
                        },
                      },
                      y2: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                          display: true,
                          text: 'Minutes',
                        },
                        beginAtZero: true,
                        grid: {
                          drawOnChartArea: false,
                        },
                      },
                    },
                  }}
                />
              </Card>
            </div>
          </div>
        )}

        {/* Activities Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">This Week's Activities</h2>
            <Link href="/activities/new" passHref legacyBehavior>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Log Activity
              </Button>
            </Link>
          </div>
          {activities.length === 0 ? (
            <Card className="text-center">No activities logged this week. Click &quot;Log Activity&quot; to add your first!</Card>
          ) : (
            activities.map((activity) => (
              <Link key={activity.id} href={`/activities/${activity.id}`} className="block">
                <Card className="flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors">
                  <div>
                    <div className="font-semibold capitalize">{activity.type}</div>
                    <div className="text-gray-600 text-sm">{new Date(activity.date).toLocaleDateString()}</div>
                    {activity.notes && <div className="text-gray-500 text-xs mt-1">{activity.notes}</div>}
                  </div>
                  <div className="text-right mt-2 md:mt-0">
                    <span className="text-gray-700 block">{activity.duration} min</span>
                    {activity.calories !== undefined && (
                      <span className="text-green-700 font-semibold block">{activity.calories} kcal</span>
                    )}
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
