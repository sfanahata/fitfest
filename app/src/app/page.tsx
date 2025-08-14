"use client";
import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Link from "next/link";
import Button from "@/components/Button";
import NavBar from "@/components/NavBar";
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

interface Meal {
  id: string;
  name: string;
  type: string;
  date: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
}

interface DailyStats {
  date: string;
  duration: number;
  calories: number;
  activities: number;
  consumedCalories: number;
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
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeChart, setActiveChart] = useState<'activity' | 'burned' | 'consumed'>('activity');

  // Check authentication status using cookies
  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('Checking authentication...');
        console.log('Cookies:', document.cookie);
        
        // Check if we have a NextAuth session cookie (database sessions use different names)
        const hasSessionCookie = document.cookie.includes('next-auth.session-token') || 
                                document.cookie.includes('__Secure-next-auth.session-token') ||
                                document.cookie.includes('next-auth.csrf-token') ||
                                document.cookie.includes('__Secure-next-auth.csrf-token');
        
        console.log('Has session cookie:', hasSessionCookie);
        
        // Always try to fetch session data (server-side session might work even without client cookies)
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log('Session response status:', response.status);
        
        if (response.ok) {
          const session = await response.json();
          console.log('Session data:', session);
          setIsAuthenticated(!!session.user);
        } else {
          console.log('Session response not ok');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    }
    
    checkAuth();
  }, []);

  // Temporarily disabled all authentication
  // useEffect(() => {
  //   if (status === "loading") return;
  //   const timer = setTimeout(() => {
  //     if (!session) {
  //       router.push("/auth/signin");
  //     }
  //     setAuthChecked(true);
  //   }, 1000);
  //   return () => clearTimeout(timer);
  // }, [session, status, router]);

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
    async function fetchData() {
      setLoading(true);
      try {
        const [activitiesRes, dashboardRes] = await Promise.all([
          fetch("/api/activities", { credentials: 'include' }),
          fetch("/api/dashboard", { credentials: 'include' }),
        ]);
        
        if (activitiesRes.ok) {
          const data = await activitiesRes.json();
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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [isAuthenticated]);

  // Temporarily disabled loading states
  // if (status === "loading" || !authChecked) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen">
  //       <Card className="w-full max-w-4xl">Loading...</Card>
  //     </div>
  //   );
  // }

  // if (!session) {
  //   return null;
  // }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-4xl">Loading...</Card>
      </div>
    );
  }

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-4xl">Checking authentication...</Card>
      </div>
    );
  }

  // Helper function to get day labels
  const getDayLabels = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return days[date.getDay()];
    });
  };

  // Helper function to aggregate daily data
  const getDailyData = () => {
    const dayLabels = getDayLabels();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get activities for this day
      const dayActivities = activities.filter(activity => 
        activity.date.startsWith(dateStr)
      );
      
      // Get meals for this day
      const dayMeals = meals.filter(meal => 
        meal.date.startsWith(dateStr)
      );
      
      return {
        date: dateStr,
        duration: dayActivities.reduce((sum, activity) => sum + activity.duration, 0),
        caloriesBurned: dayActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0),
        caloriesConsumed: dayMeals.reduce((sum, meal) => sum + meal.calories, 0),
        activities: dayActivities.length,
        meals: dayMeals.length,
      };
    });

    return { dayLabels, dailyData };
  };

  const { dayLabels, dailyData } = getDailyData();

  // Chart configurations
  const activityDurationChartData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Activity Duration (min)',
        data: dailyData.map(d => d.duration),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const caloriesBurnedChartData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Calories Burned',
        data: dailyData.map(d => d.caloriesBurned),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const caloriesConsumedChartData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Calories Consumed',
        data: dailyData.map(d => d.caloriesConsumed),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const weeklyComparisonChartData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'This Week - Duration',
        data: dashboardData?.thisWeek?.daily?.map(d => d.duration) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Last Week - Duration',
        data: dashboardData?.lastWeek?.daily?.map(d => d.duration) || [],
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
      },
    ],
  };

  const activityChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Activity Duration',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.ceil(Math.max(...dailyData.map(d => d.duration), 1) * 1.5),
        title: {
          display: true,
          text: 'Minutes',
        },
      },
    },
  };

  const caloriesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Calories',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.ceil(Math.max(...dailyData.map(d => d.caloriesBurned), 1) * 1.5),
        title: {
          display: true,
          text: 'Calories',
        },
      },
    },
  };

  const caloriesConsumedChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Calories Consumed',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.ceil(Math.max(...dailyData.map(d => d.caloriesConsumed), 1) * 1.5),
        title: {
          display: true,
          text: 'Calories',
        },
      },
    },
  };

  const comparisonChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Comparison - Activity Duration',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.ceil(Math.max(...(dashboardData?.thisWeek?.daily?.map(d => d.duration) || []), ...(dashboardData?.lastWeek?.daily?.map(d => d.duration) || []), 1) * 1.5),
      },
    },
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen px-2">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {/* Welcome Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Welcome to FitFest</h1>
          <p className="text-xl text-gray-600 mb-8 text-center">Your personal fitness journey starts here. Track, share, and achieve your fitness goals.</p>
          
          {/* Authentication Status */}
          {!isAuthenticated && (
            <Card className="text-center p-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">🔐 Sign In Required</h2>
              <p className="text-gray-600 mb-4">Please sign in to access your fitness dashboard and track your activities.</p>
              <div className="space-y-2">
                <a 
                  href="/api/auth/signin" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Sign In with Magic Link
                </a>
              </div>
            </Card>
          )}

          {/* Dashboard - Only show when authenticated */}
          {isAuthenticated && (
            <>
              {/* Summary Stats */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  Week: {(() => {
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    
                    return `${startOfWeek.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })} - ${endOfWeek.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}`;
                  })()}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {dashboardData?.thisWeek?.totalCalories || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Calories Burned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400">
                      {dailyData.reduce((sum, day) => sum + day.caloriesConsumed, 0)}
                    </div>
                    <div className="text-gray-600 text-sm">Calories Consumed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-400">
                      {dashboardData?.thisWeek?.totalDuration || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Total Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400">
                      {dashboardData?.thisWeek?.daysWithActivity || 0}/7
                    </div>
                    <div className="text-gray-600 text-sm">Days with Activity</div>
                  </div>
                </div>
              </Card>

              {/* Charts Section - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Progress Chart - Tabbed Widget */}
                <Card className="p-4">
                  <div className="mb-3">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setActiveChart('activity')}
                        className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                          activeChart === 'activity'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Duration
                      </button>
                      <button
                        onClick={() => setActiveChart('burned')}
                        className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                          activeChart === 'burned'
                            ? 'bg-white text-green-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Burned
                      </button>
                      <button
                        onClick={() => setActiveChart('consumed')}
                        className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                          activeChart === 'consumed'
                            ? 'bg-white text-red-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Consumed
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-64">
                    {activeChart === 'activity' && (
                      <Line data={activityDurationChartData} options={activityChartOptions} />
                    )}
                    {activeChart === 'burned' && (
                      <Line data={caloriesBurnedChartData} options={caloriesChartOptions} />
                    )}
                    {activeChart === 'consumed' && (
                      <Line data={caloriesConsumedChartData} options={caloriesConsumedChartOptions} />
                    )}
                  </div>
                </Card>

                {/* Weekly Comparison Chart */}
                <Card className="p-4">
                  <div className="h-64">
                    <Bar data={weeklyComparisonChartData} options={comparisonChartOptions} />
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <Link href="/activities/new">
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
                      Log Activity
                    </Button>
                  </Link>
                  <Link href="/nutrition">
                    <Button className="bg-green-600 text-white hover:bg-green-700">
                      Log Meal
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Recent Activities */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Recent Activities</h2>
                  <Link href="/activities">
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
                      View All
                    </Button>
                  </Link>
                </div>
                {activities.length > 0 ? (
                  <div className="space-y-2">
                    {activities.slice(0, 5).map((activity) => (
                      <Card key={activity.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold capitalize">{activity.type}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(activity.date).toLocaleDateString()} • {activity.duration} minutes
                              {activity.calories && ` • ${activity.calories} calories`}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 capitalize">{activity.effort || 'No effort level'}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center">No activities logged this week. Start by logging your first activity!</Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
