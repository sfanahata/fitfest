import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import MealLogForm from '@/components/MealLogForm';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('MealLogForm', () => {
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

      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin');
      });
    });

    it('should show loading state initially', () => {
      (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render form when authenticated', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      });

      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        expect(screen.getByText('Log Lunch')).toBeInTheDocument();
        expect(screen.getByLabelText('Meal Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Calories')).toBeInTheDocument();
      });
    });
  });

  describe('Form Fields', () => {
    beforeEach(async () => {
      const mockSession = { user: { email: 'test@example.com' } };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      });
    });

    it('should have all required form fields', async () => {
      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        expect(screen.getByLabelText('Date')).toBeInTheDocument();
        expect(screen.getByLabelText('Meal Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Calories')).toBeInTheDocument();
        expect(screen.getByLabelText('Protein (g)')).toBeInTheDocument();
        expect(screen.getByLabelText('Carbs (g)')).toBeInTheDocument();
        expect(screen.getByLabelText('Fat (g)')).toBeInTheDocument();
      });
    });

    it('should default to today\'s date', async () => {
      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText('Date') as HTMLInputElement;
        const today = new Date().toISOString().split('T')[0];
        expect(dateInput.value).toBe(today);
      });
    });

    it('should allow date selection', async () => {
      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText('Date') as HTMLInputElement;
        fireEvent.change(dateInput, { target: { value: '2024-09-16' } });
        expect(dateInput.value).toBe('2024-09-16');
      });
    });

    it('should handle input changes correctly', async () => {
      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Meal Name') as HTMLInputElement;
        const caloriesInput = screen.getByLabelText('Calories') as HTMLInputElement;

        fireEvent.change(nameInput, { target: { value: 'Chicken Salad' } });
        fireEvent.change(caloriesInput, { target: { value: '350' } });

        expect(nameInput.value).toBe('Chicken Salad');
        expect(caloriesInput.value).toBe('350');
      });
    });
  });

  describe('Form Submission', () => {
    beforeEach(async () => {
      const mockSession = { user: { email: 'test@example.com' } };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      });
    });

    it('should submit form with correct data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Meal Name');
        const caloriesInput = screen.getByLabelText('Calories');
        const submitButton = screen.getByText('Save Meal');

        fireEvent.change(nameInput, { target: { value: 'Chicken Salad' } });
        fireEvent.change(caloriesInput, { target: { value: '350' } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/meals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Chicken Salad',
            type: 'lunch',
            date: expect.any(String),
            calories: '350',
            protein: '',
            carbs: '',
            fat: '',
          }),
        });
      });
    });

    it('should handle submission errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      // Mock alert
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Meal Name');
        const caloriesInput = screen.getByLabelText('Calories');
        const submitButton = screen.getByText('Save Meal');

        fireEvent.change(nameInput, { target: { value: 'Test Meal' } });
        fireEvent.change(caloriesInput, { target: { value: '100' } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to save meal. Please try again.');
      });

      mockAlert.mockRestore();
    });

    it('should show loading state during submission', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        }), 100))
      );

      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Meal Name');
        const caloriesInput = screen.getByLabelText('Calories');
        const submitButton = screen.getByText('Save Meal');

        fireEvent.change(nameInput, { target: { value: 'Test Meal' } });
        fireEvent.change(caloriesInput, { target: { value: '100' } });
        fireEvent.click(submitButton);
      });

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => {
      const mockSession = { user: { email: 'test@example.com' } };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      });
    });

    it('should navigate back when cancel button is clicked', async () => {
      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
      });

      expect(mockPush).toHaveBeenCalledWith('/nutrition');
    });

    it('should navigate back when back arrow is clicked', async () => {
      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: '' }); // Arrow button
        fireEvent.click(backButton);
      });

      expect(mockPush).toHaveBeenCalledWith('/nutrition');
    });
  });

  describe('Meal Type Handling', () => {
    beforeEach(async () => {
      const mockSession = { user: { email: 'test@example.com' } };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      });
    });

    it('should handle different meal types correctly', async () => {
      const { rerender } = render(<MealLogForm mealType="Breakfast" mealIcon="🍳" />);

      await waitFor(() => {
        expect(screen.getByText('Log Breakfast')).toBeInTheDocument();
      });

      rerender(<MealLogForm mealType="Dinner" mealIcon="🍽️" />);

      await waitFor(() => {
        expect(screen.getByText('Log Dinner')).toBeInTheDocument();
      });
    });

    it('should map meal types to correct database values', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<MealLogForm mealType="Snacks" mealIcon="🍎" />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Meal Name');
        const caloriesInput = screen.getByLabelText('Calories');
        const submitButton = screen.getByText('Save Meal');

        fireEvent.change(nameInput, { target: { value: 'Apple' } });
        fireEvent.change(caloriesInput, { target: { value: '50' } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/meals', expect.objectContaining({
          body: expect.stringContaining('"type":"snacks"'), // Note: 'snacks' (plural) to match Prisma enum
        }));
      });
    });
  });

  // Intentionally flaky tests for Sentry Test Analytics demonstration
  describe('Flaky Tests for Analytics Demo', () => {
    beforeEach(async () => {
      const mockSession = { user: { email: 'test@example.com' } };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      });
    });

    it('should sometimes fail due to race conditions', async () => {
      // This test is intentionally flaky due to race conditions
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              resolve(i);
            }, Math.random() * 50);
          })
        );
      }
      
      const results = await Promise.all(promises);
      
      // This will fail ~20% of the time due to race conditions
      if (Math.random() < 0.2) {
        throw new Error('Race condition detected in form handling');
      }
      
      expect(results).toHaveLength(5);
    });

    it('should fail when form validation is too strict', async () => {
      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Meal Name');
        
        // This might fail if validation is too strict
        fireEvent.change(nameInput, { target: { value: 'a' } }); // Very short name
        
        // Strict validation might reject this
        if (nameInput.value.length < 2) {
          throw new Error('Form validation too strict for short names');
        }
        
        expect(nameInput.value).toBe('a');
      });
    });

    it('should handle network timeouts gracefully', async () => {
      // Mock a slow network request
      (fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() < 0.3) {
              reject(new Error('Network timeout'));
            } else {
              resolve({
                ok: true,
                json: () => Promise.resolve({ success: true }),
              });
            }
          }, 200);
        })
      );

      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Meal Name');
        const caloriesInput = screen.getByLabelText('Calories');
        const submitButton = screen.getByText('Save Meal');

        fireEvent.change(nameInput, { target: { value: 'Test Meal' } });
        fireEvent.change(caloriesInput, { target: { value: '100' } });
        fireEvent.click(submitButton);
      });

      // This test might fail due to network timeouts
      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should validate numeric inputs correctly', async () => {
      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const caloriesInput = screen.getByLabelText('Calories') as HTMLInputElement;
        
        // Test with negative numbers (should be invalid)
        fireEvent.change(caloriesInput, { target: { value: '-100' } });
        
        // This might fail if validation doesn't handle negative numbers
        if (parseInt(caloriesInput.value) < 0) {
          throw new Error('Negative calories should not be allowed');
        }
        
        expect(caloriesInput.value).toBe('-100'); // HTML input allows this
      });
    });

    it('should handle concurrent form submissions', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Meal Name');
        const caloriesInput = screen.getByLabelText('Calories');
        const submitButton = screen.getByText('Save Meal');

        fireEvent.change(nameInput, { target: { value: 'Test Meal' } });
        fireEvent.change(caloriesInput, { target: { value: '100' } });
        
        // Simulate rapid clicking (might cause issues)
        fireEvent.click(submitButton);
        fireEvent.click(submitButton);
        fireEvent.click(submitButton);
      });

      // This might fail if the form doesn't handle rapid submissions
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });

    it('should maintain form state during navigation', async () => {
      render(<MealLogForm mealType="Lunch" mealIcon="🥗" />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Meal Name');
        fireEvent.change(nameInput, { target: { value: 'Test Meal' } });
        
        // Simulate navigation away and back
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
      });

      // This might fail if form state isn't properly managed
      expect(mockPush).toHaveBeenCalledWith('/nutrition');
    });
  });
});
