import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import NutritionPage from '@/app/nutrition/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('NutritionPage', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (fetch as jest.Mock).mockClear();
    mockPush.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should redirect to sign-in when not authenticated', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      render(<NutritionPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin');
      });
    });

    it('should show loading state initially', () => {
      (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<NutritionPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render nutrition page when authenticated', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSession),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ meals: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ profile: { targetCalories: 2000 } }),
        });

      render(<NutritionPage />);

      await waitFor(() => {
        expect(screen.getByText('Food diary')).toBeInTheDocument();
      });
    });
  });

  describe('Date Selection', () => {
    beforeEach(async () => {
      const mockSession = { user: { email: 'test@example.com' } };
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSession),
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ meals: [] }),
        });
    });

    it('should display current date by default', async () => {
      render(<NutritionPage />);

      await waitFor(() => {
        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        expect(screen.getByText(dayName)).toBeInTheDocument();
      });
    });

    it('should allow date selection from week view', async () => {
      render(<NutritionPage />);

      await waitFor(() => {
        const dateButtons = screen.getAllByRole('button');
        const dateButton = dateButtons.find(btn => btn.textContent?.includes('Today'));
        expect(dateButton).toBeInTheDocument();
      });
    });

    it('should fetch meals for selected date', async () => {
      render(<NutritionPage />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/meals?date='),
          expect.any(Object)
        );
      });
    });
  });

  describe('Meal Display', () => {
    const mockMeals = [
      {
        id: '1',
        name: 'Chicken Salad',
        type: 'lunch',
        calories: 350,
        protein: 25,
        carbs: 15,
        fat: 20,
        date: '2024-09-16'
      },
      {
        id: '2',
        name: 'Oatmeal',
        type: 'breakfast',
        calories: 200,
        protein: 8,
        carbs: 35,
        fat: 5,
        date: '2024-09-16'
      }
    ];

    beforeEach(async () => {
      const mockSession = { user: { email: 'test@example.com' } };
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSession),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ meals: mockMeals }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ profile: { targetCalories: 2000 } }),
        });
    });

    it('should display total calories correctly', async () => {
      render(<NutritionPage />);

      await waitFor(() => {
        expect(screen.getByText('550')).toBeInTheDocument(); // 350 + 200
        expect(screen.getByText('of 2,000 kcal')).toBeInTheDocument();
      });
    });

    it('should display macro totals correctly', async () => {
      render(<NutritionPage />);

      await waitFor(() => {
        expect(screen.getByText('33')).toBeInTheDocument(); // 25 + 8 protein
        expect(screen.getByText('50')).toBeInTheDocument(); // 15 + 35 carbs
        expect(screen.getByText('25')).toBeInTheDocument(); // 20 + 5 fat
      });
    });

    it('should display individual meals in correct categories', async () => {
      render(<NutritionPage />);

      await waitFor(() => {
        expect(screen.getByText('Chicken Salad')).toBeInTheDocument();
        expect(screen.getByText('Oatmeal')).toBeInTheDocument();
        expect(screen.getByText('350 kcal')).toBeInTheDocument();
        expect(screen.getByText('200 kcal')).toBeInTheDocument();
      });
    });

    it('should display snacks in the Snacks section', async () => {
      const mockMealsWithSnacks = [
        {
          id: '1',
          name: 'Apple',
          type: 'snacks',
          calories: 50,
          protein: 0,
          carbs: 13,
          fat: 0,
          date: '2024-09-16'
        },
        {
          id: '2',
          name: 'Chicken Salad',
          type: 'lunch',
          calories: 350,
          protein: 25,
          carbs: 15,
          fat: 20,
          date: '2024-09-16'
        }
      ];

      const mockSession = { user: { email: 'test@example.com' } };
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSession),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ meals: mockMealsWithSnacks }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ profile: { targetCalories: 2000 } }),
        });

      render(<NutritionPage />);

      await waitFor(() => {
        // Should show the snack in the Snacks section
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('50 kcal')).toBeInTheDocument();
        // Should also show the lunch meal
        expect(screen.getByText('Chicken Salad')).toBeInTheDocument();
        expect(screen.getByText('350 kcal')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => {
      const mockSession = { user: { email: 'test@example.com' } };
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSession),
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ meals: [] }),
        });
    });

    it('should have log buttons for each meal type', async () => {
      render(<NutritionPage />);

      await waitFor(() => {
        const logButtons = screen.getAllByText('Log');
        expect(logButtons).toHaveLength(4); // Breakfast, Lunch, Dinner, Snacks
      });
    });

    it('should navigate to correct meal log pages', async () => {
      render(<NutritionPage />);

      await waitFor(() => {
        const lunchLogButton = screen.getAllByText('Log')[1]; // Second log button (Lunch)
        expect(lunchLogButton.closest('a')).toHaveAttribute('href', '/nutrition/lunch/log');
      });
    });
  });

  // Intentionally flaky tests for Sentry Test Analytics demonstration
  describe('Flaky Tests for Analytics Demo', () => {
    beforeEach(async () => {
      const mockSession = { user: { email: 'test@example.com' } };
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSession),
        });
    });

    it('should sometimes fail due to timing issues', async () => {
      // This test is intentionally flaky - it will fail ~30% of the time
      const randomValue = Math.random();
      
      // Simulate async operation that might timeout
      await new Promise(resolve => setTimeout(resolve, randomValue * 100));
      
      if (randomValue < 0.3) {
        throw new Error('Random timing failure for analytics demo');
      }
      
      expect(randomValue).toBeGreaterThanOrEqual(0);
    });

    it('should fail when environment variables are missing', async () => {
      // This test will fail if certain conditions aren't met
      const requiredEnvVar = process.env.NODE_ENV;
      
      if (!requiredEnvVar || requiredEnvVar === 'production') {
        throw new Error('Environment variable missing or incorrect for test');
      }
      
      expect(requiredEnvVar).toBe('test');
    });

    it('should handle async operations that might timeout', async () => {
      // Simulate a potentially slow operation
      const startTime = Date.now();
      
      // Mock a slow fetch response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ meals: [] }),
          }), 50) // 50ms delay
        )
      );

      render(<NutritionPage />);

      await waitFor(() => {
        expect(screen.getByText('Food diary')).toBeInTheDocument();
      }, { timeout: 1000 });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should validate button component with strict assertions', async () => {
      render(<NutritionPage />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        
        // This assertion might fail if the number of buttons changes
        expect(buttons.length).toBeGreaterThan(5);
        
        // Check for specific button types
        const logButtons = buttons.filter(btn => btn.textContent?.includes('Log'));
        expect(logButtons.length).toBe(4);
      });
    });

    it('should test dark mode functionality', async () => {
      // This test might fail if dark mode classes aren't properly applied
      render(<NutritionPage />);

      await waitFor(() => {
        const container = screen.getByText('Food diary').closest('div');
        expect(container).toHaveClass('dark:bg-fitfest-dark-secondary');
      });
    });

    it('should handle network requests successfully', async () => {
      // This test will fail if network requests don't complete in time
      const mockSession = { user: { email: 'test@example.com' } };
      
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSession),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ meals: [] }),
        });

      render(<NutritionPage />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/auth/session', expect.any(Object));
      });
    });

    it('should validate form validation logic', async () => {
      // This test validates that form validation works correctly
      const mockMeals = [
        {
          id: '1',
          name: 'Test Meal',
          type: 'lunch',
          calories: 0, // Invalid calories
          protein: null,
          carbs: null,
          fat: null,
          date: '2024-09-16'
        }
      ];

      const mockSession = { user: { email: 'test@example.com' } };
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSession),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ meals: mockMeals }),
        });

      render(<NutritionPage />);

      await waitFor(() => {
        // Should handle zero calories gracefully
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });
  });
});
