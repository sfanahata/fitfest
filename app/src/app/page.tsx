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
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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



  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen px-2">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {/* Welcome Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Welcome to FitFest</h1>
          <p className="text-xl text-gray-600 mb-8 text-center">Your personal fitness journey starts here. Track, share, and achieve your fitness goals.</p>
          
          {/* Authentication Status */}
          {isAuthenticated ? (
            <Card className="text-center p-6">
              <h2 className="text-2xl font-bold text-green-600 mb-2">✅ Welcome Back!</h2>
              <p className="text-gray-600 mb-4">You're signed in and ready to track your fitness journey.</p>
              <div className="space-y-2">
                <a 
                  href="/api/auth/signout" 
                  className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Sign Out
                </a>
              </div>
            </Card>
          ) : (
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
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Your Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {dashboardData?.thisWeek?.totalCalories || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Total Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {dashboardData?.thisWeek?.avgDailyCalories || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Avg Daily Calories</div>
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

              {/* Activities Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">This Week's Activities</h2>
                  <Link href="/activities/new">
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
                      Log Activity
                    </Button>
                  </Link>
                </div>
                {activities.length > 0 ? (
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <Card key={activity.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{activity.type}</h3>
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
