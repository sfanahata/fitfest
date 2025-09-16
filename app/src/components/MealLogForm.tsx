'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface MealLogFormProps {
  mealType: string;
  mealIcon: string;
}

interface Session {
  user?: {
    email?: string;
  };
}

export default function MealLogForm({ mealType, mealIcon }: MealLogFormProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    date: new Date().toISOString().split('T')[0] // Default to today's date
  });

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
        } else {
          router.push("/auth/signin");
          return;
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        router.push("/auth/signin");
        return;
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-fitfest-dark flex items-center justify-center transition-colors duration-200">
        <div className="text-center text-gray-900 dark:text-fitfest-subtle">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!session?.user) {
    return null; // Redirect handled by useEffect
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert meal type to database enum format
      const typeMap: { [key: string]: string } = {
        'Breakfast': 'breakfast',
        'Lunch': 'lunch',
        'Dinner': 'dinner',
        'Snacks': 'snack' // Note: enum uses 'snack' not 'snacks'
      };

      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: typeMap[mealType],
          date: formData.date, // Use selected date instead of current timestamp
          calories: formData.calories,
          protein: formData.protein || null,
          carbs: formData.carbs || null,
          fat: formData.fat || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save meal');
      }

      const result = await response.json();
      console.log('Meal saved successfully:', result);
      
      // Redirect back to nutrition page
      router.push('/nutrition');
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Failed to save meal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/nutrition');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-fitfest-dark transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-fitfest-dark-secondary shadow-sm border-b border-fitfest-subtle/20 dark:border-fitfest-subtle/10 transition-colors duration-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-fitfest-dark-tertiary rounded-full transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-fitfest-subtle" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{mealIcon}</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-fitfest-subtle">Log {mealType}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto mt-8 px-4">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-fitfest-dark-secondary rounded-lg shadow-sm p-6 space-y-4 transition-colors duration-200">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-fitfest-subtle mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-fitfest-subtle/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-fitfest-subtle mb-1">
              Meal Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-fitfest-subtle/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle placeholder-gray-500 dark:placeholder-fitfest-subtle/50 transition-colors duration-200"
              placeholder="e.g., Oatmeal with berries"
              required
            />
          </div>

          <div>
            <label htmlFor="calories" className="block text-sm font-medium text-gray-700 dark:text-fitfest-subtle mb-1">
              Calories
            </label>
            <input
              type="number"
              id="calories"
              name="calories"
              value={formData.calories}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-fitfest-subtle/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle placeholder-gray-500 dark:placeholder-fitfest-subtle/50 transition-colors duration-200"
              placeholder="e.g., 300"
              min="0"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-gray-700 dark:text-fitfest-subtle mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                id="protein"
                name="protein"
                value={formData.protein}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-fitfest-subtle/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle placeholder-gray-500 dark:placeholder-fitfest-subtle/50 transition-colors duration-200"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 dark:text-fitfest-subtle mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                id="carbs"
                name="carbs"
                value={formData.carbs}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-fitfest-subtle/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle placeholder-gray-500 dark:placeholder-fitfest-subtle/50 transition-colors duration-200"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-gray-700 dark:text-fitfest-subtle mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                id="fat"
                name="fat"
                value={formData.fat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-fitfest-subtle/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle placeholder-gray-500 dark:placeholder-fitfest-subtle/50 transition-colors duration-200"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-fitfest-subtle bg-gray-100 dark:bg-fitfest-dark-tertiary border border-gray-300 dark:border-fitfest-subtle/20 rounded-md hover:bg-gray-200 dark:hover:bg-fitfest-dark-tertiary/80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
