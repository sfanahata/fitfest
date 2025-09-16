'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface MacroData {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

interface MealOption {
  name: string;
  calories: number;
  icon: string;
  logPath: string;
}

interface Meal {
  id: string;
  name: string;
  type: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  date: string;
}

export default function NutritionPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [macros, setMacros] = useState<MacroData[]>([
    { name: 'Protein', current: 0, target: 98, unit: 'g', color: 'bg-fitfest-deep' },
    { name: 'Carbs', current: 0, target: 244, unit: 'g', color: 'bg-fitfest-bright' },
    { name: 'Fat', current: 0, target: 68, unit: 'g', color: 'bg-fitfest-success' },
  ]);
  
  // Target values - will be updated from profile
  const [targetCalories, setTargetCalories] = useState(2000);

  const mealOptions: MealOption[] = [
    { name: 'Breakfast', calories: 0, icon: '🍳', logPath: '/nutrition/breakfast/log' },
    { name: 'Lunch', calories: 0, icon: '🥗', logPath: '/nutrition/lunch/log' },
    { name: 'Dinner', calories: 0, icon: '🍽️', logPath: '/nutrition/dinner/log' },
    { name: 'Snacks', calories: 0, icon: '🍎', logPath: '/nutrition/snacks/log' },
  ];

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
          setStatus(sessionData.user ? 'authenticated' : 'unauthenticated');
        } else {
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        setStatus('unauthenticated');
      }
    }
    
    checkAuth();
  }, []);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
  }, [status, router]);

  // Fetch meals for selected date
  const fetchMeals = async (date: Date) => {
    // Only fetch if authenticated
    if (!session) return;

    try {
      setLoading(true);
      const dateString = date.toISOString().split('T')[0];
      const response = await fetch(`/api/meals?date=${dateString}`);
      
      if (response.ok) {
        const data = await response.json();
        setMeals(data.meals || []);
      } else {
        console.error('Failed to fetch meals');
        setMeals([]);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals from meals
  const calculateTotals = () => {
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    const totalFat = meals.reduce((sum, meal) => sum + (meal.fat || 0), 0);

    return { totalCalories, totalProtein, totalCarbs, totalFat };
  };

  // Calculate meal totals by type
  const calculateMealTotals = () => {
    const mealTotals = { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };
    
    meals.forEach(meal => {
      if (meal.type in mealTotals) {
        mealTotals[meal.type as keyof typeof mealTotals] += meal.calories;
      }
    });

    return mealTotals;
  };

  // Update macros with real data
  const updateMacros = () => {
    const { totalProtein, totalCarbs, totalFat } = calculateTotals();
    
    setMacros([
      { name: 'Protein', current: totalProtein, target: 98, unit: 'g', color: 'bg-fitfest-deep' },
      { name: 'Carbs', current: totalCarbs, target: 244, unit: 'g', color: 'bg-fitfest-bright' },
      { name: 'Fat', current: totalFat, target: 68, unit: 'g', color: 'bg-fitfest-success' },
    ]);
  };

  // Update meal options with real data
  const updateMealOptions = () => {
    const mealTotals = calculateMealTotals();
    
    mealOptions[0].calories = mealTotals.breakfast;
    mealOptions[1].calories = mealTotals.lunch;
    mealOptions[2].calories = mealTotals.dinner;
    mealOptions[3].calories = mealTotals.snacks;
  };

  // Fetch user profile data for targets
  useEffect(() => {
    if (!session) return;
    
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const profile = data.profile;
          
          // Update targets from profile
          if (profile?.targetCalories) {
            setTargetCalories(profile.targetCalories);
          }
          
          // Update macro targets while preserving current values
          setMacros(prevMacros => [
            { name: 'Protein', current: prevMacros[0]?.current || 0, target: profile?.targetProtein || 98, unit: 'g', color: 'bg-fitfest-deep' },
            { name: 'Carbs', current: prevMacros[1]?.current || 0, target: profile?.targetCarbs || 244, unit: 'g', color: 'bg-fitfest-bright' },
            { name: 'Fat', current: prevMacros[2]?.current || 0, target: profile?.targetFat || 68, unit: 'g', color: 'bg-fitfest-success' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
    
    fetchProfile();
  }, [session]);

  // Fetch meals when date changes
  useEffect(() => {
    fetchMeals(selectedDate);
  }, [selectedDate, session]);

  // Update calculations when meals change
  useEffect(() => {
    updateMacros();
    updateMealOptions();
  }, [meals]);

  // Refresh data when page becomes visible (returning from meal logging)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session) {
        fetchMeals(selectedDate);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedDate, session]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-fitfest-dark flex items-center justify-center transition-colors duration-200">
        <div className="text-center text-fitfest-text dark:text-fitfest-subtle">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const generateWeekDates = () => {
    const dates = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = generateWeekDates();
  const { totalCalories } = calculateTotals();

  return (
    <div className="min-h-screen bg-fitfest-light dark:bg-fitfest-dark transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-fitfest-dark-secondary shadow-sm border-b border-fitfest-subtle/20 dark:border-fitfest-subtle/10 transition-colors duration-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-fitfest-light dark:hover:bg-fitfest-dark-tertiary rounded-full transition-colors duration-200">
              <ChevronLeftIcon className="w-5 h-5 text-fitfest-text dark:text-fitfest-subtle" />
            </button>
            <h1 className="text-xl font-bold text-fitfest-deep dark:text-fitfest-subtle">Food diary</h1>
          </div>
        </div>
        
        {/* Date Display */}
        <div className="px-4 pb-4">
          <p className="text-fitfest-text dark:text-fitfest-subtle text-sm">
            {getDayName(selectedDate)}, {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Date Picker */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto">
            {weekDates.map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-center min-w-[60px] h-16 rounded-lg text-sm font-medium transition-colors ${
                  selectedDate.toDateString() === date.toDateString()
                    ? 'bg-fitfest-deep text-white dark:bg-fitfest-bright dark:text-fitfest-dark'
                    : 'bg-white dark:bg-fitfest-dark-secondary text-fitfest-text dark:text-fitfest-subtle hover:bg-fitfest-light dark:hover:bg-fitfest-dark-tertiary border border-fitfest-subtle/20 dark:border-fitfest-subtle/10'
                }`}
              >
                <span className="text-xs opacity-70">
                  {isToday(date) ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-lg">{getDayNumber(date)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calorie Summary */}
      <div className="bg-white dark:bg-fitfest-dark-secondary mx-4 mt-4 rounded-lg p-6 shadow-sm border border-fitfest-subtle/20 dark:border-fitfest-subtle/10 transition-colors duration-200">
        <div className="text-center">
          <div className="text-4xl font-bold text-fitfest-deep dark:text-fitfest-subtle mb-1">
            {loading ? '...' : totalCalories}
          </div>
          <div className="text-fitfest-text dark:text-fitfest-subtle text-sm">
            of {targetCalories.toLocaleString()} kcal
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="bg-white dark:bg-fitfest-dark-secondary mx-4 mt-4 rounded-lg p-4 shadow-sm border border-fitfest-subtle/20 dark:border-fitfest-subtle/10 transition-colors duration-200">
        <div className="grid grid-cols-3 gap-4">
          {macros.map((macro) => {
            const percentage = Math.min((macro.current / macro.target) * 100, 100);
            return (
              <div key={macro.name} className="text-center">
                <div className="text-sm font-medium text-fitfest-text dark:text-fitfest-subtle mb-1">{macro.name}</div>
                <div className="text-lg font-bold text-fitfest-deep dark:text-fitfest-subtle mb-2">
                  {loading ? '...' : Math.round(macro.current)}
                  <span className="text-sm font-normal text-fitfest-subtle dark:text-fitfest-subtle/70">/{macro.target}{macro.unit}</span>
                </div>
                <div className="w-full bg-fitfest-light dark:bg-fitfest-dark-tertiary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${macro.color}`}
                    style={{ width: loading ? '0%' : `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meal Options */}
      <div className="mx-4 mt-4 mb-6">
        <div className="space-y-3">
          {mealOptions.map((meal) => {
            // Get meals for this category
            const categoryMeals = meals.filter(m => {
              const typeMap: { [key: string]: string } = {
                'Breakfast': 'breakfast',
                'Lunch': 'lunch', 
                'Dinner': 'dinner',
                'Snacks': 'snack'
              };
              return m.type === typeMap[meal.name];
            });

            return (
                              <div
                  key={meal.name}
                  className="bg-white dark:bg-fitfest-dark-secondary rounded-lg shadow-sm border border-fitfest-subtle/20 dark:border-fitfest-subtle/10 overflow-hidden transition-colors duration-200"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between p-4 border-b border-fitfest-subtle/20 dark:border-fitfest-subtle/10">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{meal.icon}</div>
                    <div>
                      <h3 className="font-medium text-fitfest-deep dark:text-fitfest-subtle">{meal.name}</h3>
                      {meal.calories > 0 && (
                        <p className="text-sm text-fitfest-text dark:text-fitfest-subtle">{meal.calories} kcal</p>
                      )}
                    </div>
                  </div>
                  <Link href={meal.logPath}>
                    <button className="flex items-center gap-2 bg-fitfest-deep text-white px-4 py-2 rounded-lg hover:bg-fitfest-bright dark:bg-fitfest-bright dark:hover:bg-fitfest-deep transition-colors">
                      <PlusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Log</span>
                    </button>
                  </Link>
                </div>

                {/* Individual Meals */}
                {categoryMeals.length > 0 ? (
                  <div className="divide-y divide-fitfest-light dark:divide-fitfest-dark-tertiary">
                    {categoryMeals.map((mealItem) => (
                      <div key={mealItem.id} className="p-4 bg-fitfest-light/50 dark:bg-fitfest-dark-tertiary/50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-fitfest-deep dark:text-fitfest-subtle">{mealItem.name}</h4>
                            <div className="flex gap-4 text-sm text-fitfest-text dark:text-fitfest-subtle mt-1">
                              <span>{mealItem.calories} kcal</span>
                              {mealItem.protein && <span>{mealItem.protein}g protein</span>}
                              {mealItem.carbs && <span>{mealItem.carbs}g carbs</span>}
                              {mealItem.fat && <span>{mealItem.fat}g fat</span>}
                            </div>
                          </div>
                          <div className="text-xs text-fitfest-subtle dark:text-fitfest-subtle/70">
                            {new Date(mealItem.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-fitfest-subtle dark:text-fitfest-subtle/70 text-sm">
                    No meals logged yet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
