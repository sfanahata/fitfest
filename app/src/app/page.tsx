"use client";
import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Link from "next/link";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
import StreakBanner from "@/components/StreakBanner";
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

interface StreakData {
  currentWeek: {
    daysWithActivity: number;
    totalActivities: number;
    totalDuration: number;
    totalCalories: number;
    hasStreak: boolean;
    streakMessage: string;
    activitiesByDay: Record<string, Activity[]>;
  };
  lastWeek: {
    daysWithActivity: number;
    totalActivities: number;
    totalDuration: number;
    totalCalories: number;
  };
}

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
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
        const [activitiesRes, mealsRes, dashboardRes, streakRes] = await Promise.all([
          fetch("/api/activities", { credentials: 'include' }),
          fetch("/api/meals", { credentials: 'include' }),
          fetch("/api/dashboard", { credentials: 'include' }),
          fetch("/api/streak", { credentials: 'include' }),
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
        
        if (mealsRes.ok) {
          const data = await mealsRes.json();
          console.log('Meals API response:', data);
          const now = new Date();
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          const thisWeekMeals = data.meals.filter((meal: Meal) => 
            new Date(meal.date) >= startOfWeek
          );
          console.log('This week meals:', thisWeekMeals);
          setMeals(thisWeekMeals);
        }
        
        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          setDashboardData(data);
        }
        
        if (streakRes.ok) {
          const data = await streakRes.json();
          setStreakData(data.streak);
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
      
      // Use local date string instead of UTC to avoid timezone issues
      const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      // Get activities for this day
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate.toLocaleDateString('en-CA') === dateStr;
      });
      
      // Get meals for this day
      const dayMeals = meals.filter(meal => {
        const mealDate = new Date(meal.date);
        return mealDate.toLocaleDateString('en-CA') === dateStr;
      });
      
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
        borderColor: '#005B6A',
        backgroundColor: 'rgba(0, 91, 106, 0.2)',
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
        borderColor: '#00A7B5',
        backgroundColor: 'rgba(0, 167, 181, 0.2)',
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
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.2)',
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
        backgroundColor: 'rgba(0, 91, 106, 0.8)',
      },
      {
        label: 'Last Week - Duration',
        data: dashboardData?.lastWeek?.daily?.map(d => d.duration) || [],
        backgroundColor: 'rgba(160, 174, 192, 0.8)',
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
      <div className="flex flex-col items-center justify-center min-h-screen px-2 bg-fitfest-light dark:bg-fitfest-dark transition-colors duration-200">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {/* Welcome Message */}
          <div className="text-center mb-8 flex flex-col items-center justify-center">
            <Logo size="3xl" className="mb-4" variant="default" showText={true} />
            <p className="text-xl text-fitfest-text dark:text-fitfest-subtle">Your personal fitness journey starts here. Track, share, and achieve your fitness goals.</p>
          </div>
          
          {/* Authentication Status */}
          {!isAuthenticated && (
            <Card className="text-center p-6">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">🔐 Sign In Required</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Please sign in to access your fitness dashboard and track your activities.</p>
              <div className="space-y-2">
                <a 
                  href="/api/auth/signin" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Sign In with Magic Link
                </a>
              </div>
            </Card>
          )}

          {/* Dashboard - Only show when authenticated */}
          {isAuthenticated && (
            <>
              {/* Streak Banner */}
              {streakData && (
                <StreakBanner
                  daysWithActivity={streakData.currentWeek.daysWithActivity}
                  streakMessage={streakData.currentWeek.streakMessage}
                  hasStreak={streakData.currentWeek.hasStreak}
                  totalActivities={streakData.currentWeek.totalActivities}
                  totalDuration={streakData.currentWeek.totalDuration}
                  totalCalories={streakData.currentWeek.totalCalories}
                />
              )}
              
              {/* Summary Stats */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 text-fitfest-text dark:text-fitfest-subtle">
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
                    <div className="text-3xl font-bold text-fitfest-deep dark:text-fitfest-bright">
                      {dashboardData?.thisWeek?.totalCalories || 0}
                    </div>
                    <div className="text-fitfest-text dark:text-fitfest-subtle text-sm">Calories Burned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-fitfest-coral dark:text-fitfest-coral">
                      {dailyData.reduce((sum, day) => sum + day.caloriesConsumed, 0)}
                    </div>
                    <div className="text-fitfest-text dark:text-fitfest-subtle text-sm">Calories Consumed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-fitfest-success dark:text-fitfest-success">
                      {dashboardData?.thisWeek?.totalDuration || 0}
                    </div>
                    <div className="text-fitfest-text dark:text-fitfest-subtle text-sm">Total Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-fitfest-gold dark:text-fitfest-gold">
                      {dashboardData?.thisWeek?.daysWithActivity || 0}/7
                    </div>
                    <div className="text-fitfest-text dark:text-fitfest-subtle text-sm">Days with Activity</div>
                  </div>
                </div>
              </Card>

              {/* Charts Section - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Progress Chart - Tabbed Widget */}
                <Card className="p-4">
                  <div className="mb-3">
                    <div className="flex space-x-1 bg-gray-100 dark:bg-fitfest-dark-tertiary p-1 rounded-lg">
                      <button
                        onClick={() => setActiveChart('activity')}
                        className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                          activeChart === 'activity'
                            ? 'bg-white dark:bg-fitfest-dark-secondary text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        Duration
                      </button>
                      <button
                        onClick={() => setActiveChart('burned')}
                        className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                          activeChart === 'burned'
                            ? 'bg-white dark:bg-fitfest-dark-secondary text-green-600 dark:text-green-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        Burned
                      </button>
                      <button
                        onClick={() => setActiveChart('consumed')}
                        className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                          activeChart === 'consumed'
                            ? 'bg-white dark:bg-fitfest-dark-secondary text-red-600 dark:text-red-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
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
                <h2 className="text-xl font-bold mb-4 text-fitfest-text dark:text-fitfest-subtle">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <Link href="/activities/new">
                    <Button className="bg-fitfest-deep text-white hover:bg-fitfest-bright">
                      Log Activity
                    </Button>
                  </Link>
                  <Link href="/nutrition">
                    <Button className="bg-fitfest-success text-white hover:bg-green-600">
                      Log Meal
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Recent Activities */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-fitfest-text dark:text-fitfest-subtle">Recent Activities</h2>
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
                            <h3 className="font-semibold capitalize text-fitfest-text dark:text-fitfest-subtle">{activity.type}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(activity.date).toLocaleDateString()} • {activity.duration} minutes
                              {activity.calories && ` • ${activity.calories} calories`}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 dark:text-gray-500 capitalize">{activity.effort || 'No effort level'}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center text-fitfest-text dark:text-fitfest-subtle">No activities logged this week. Start by logging your first activity!</Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
