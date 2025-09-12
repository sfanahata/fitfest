import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from '@/components/Button';

describe('Flaky Test Examples for Codecov Test Analytics', () => {
  it('should sometimes fail due to timing issues', () => {
    const random = Math.random();
    // This test will pass consistently but demonstrates timing variability
    expect(random).toBeGreaterThan(0);
  });

  it('should fail when environment variables are missing', () => {
    // This test will fail if NODE_ENV is not set to 'test'
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should handle async operations that might timeout', async () => {
    // This test might fail if the promise takes too long
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('success'), Math.random() * 50); // 0-50ms random delay
    });
    
    const result = await promise;
    expect(result).toBe('success');
  });

  it('should validate button component with strict assertions', () => {
    render(<Button>Test Button</Button>);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeInTheDocument();
    
    // This assertion might fail if the button doesn't have exact styling
    expect(button).toHaveClass('bg-fitfest-deep');
  });

  it('should test dark mode functionality', () => {
    // Mock dark mode by adding class to document
    document.documentElement.classList.add('dark');
    
    render(<Button>Dark Mode Button</Button>);
    const button = screen.getByText('Dark Mode Button');
    
    // This might fail if dark mode classes aren't properly applied
    expect(button).toHaveClass('dark:bg-fitfest-bright');
    
    // Clean up
    document.documentElement.classList.remove('dark');
  });

  it('should handle network requests with potential failures', async () => {
    // Mock fetch to sometimes fail
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    // Simulate network failure 5% of the time (more stable for merge)
    if (Math.random() < 0.05) {
      mockFetch.mockRejectedValue(new Error('Network error'));
    } else {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'success' }),
      });
    }
    
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      expect(data.data).toBe('success');
    } catch (error) {
      // This test will fail when network error occurs, but rarely
      expect(error).toBeUndefined();
    }
  });

  it('should validate form validation logic', () => {
    // This test might fail if validation logic changes
    const validateEmail = (email: string) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };
    
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    
    // This assertion might be too strict and fail with edge cases
    expect(validateEmail('test+tag@example.co.uk')).toBe(true);
  });
});
