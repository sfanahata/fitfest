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
  
  // Target values
  const targetCalories = 2000;
  
  const macros: MacroData[] = [
    { name: 'Protein', current: 0, target: 98, unit: 'g', color: 'bg-blue-500' },
    { name: 'Carbs', current: 0, target: 244, unit: 'g', color: 'bg-orange-500' },
    { name: 'Fat', current: 0, target: 68, unit: 'g', color: 'bg-green-500' },
  ];

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
    
    macros[0].current = totalProtein;
    macros[1].current = totalCarbs;
    macros[2].current = totalFat;
  };

  // Update meal options with real data
  const updateMealOptions = () => {
    const mealTotals = calculateMealTotals();
    
    mealOptions[0].calories = mealTotals.breakfast;
    mealOptions[1].calories = mealTotals.lunch;
    mealOptions[2].calories = mealTotals.dinner;
    mealOptions[3].calories = mealTotals.snacks;
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Food diary</h1>
          </div>
        </div>
        
        {/* Date Display */}
        <div className="px-4 pb-4">
          <p className="text-gray-600 text-sm">
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
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
      <div className="bg-white mx-4 mt-4 rounded-lg p-6 shadow-sm">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {loading ? '...' : totalCalories}
          </div>
          <div className="text-gray-600 text-sm">
            of {targetCalories.toLocaleString()} kcal
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="bg-white mx-4 mt-4 rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          {macros.map((macro) => {
            const percentage = Math.min((macro.current / macro.target) * 100, 100);
            return (
              <div key={macro.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{macro.name}</span>
                  <span className="text-gray-600">
                    {loading ? '...' : `${macro.current} / ${macro.target}${macro.unit}`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
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
          {mealOptions.map((meal) => (
            <div
              key={meal.name}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{meal.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{meal.name}</h3>
                    {meal.calories > 0 && (
                      <p className="text-sm text-gray-600">{meal.calories} kcal</p>
                    )}
                  </div>
                </div>
                <Link href={meal.logPath}>
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <PlusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Log</span>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
