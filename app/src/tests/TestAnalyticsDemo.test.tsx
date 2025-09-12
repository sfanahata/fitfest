import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Button from '@/components/Button';

describe('Test Analytics Demo - Intentionally Problematic Tests', () => {
  it('should fail consistently to demonstrate test failure detection', () => {
    // This test will always fail to show how Codecov identifies failures
    expect(2 + 2).toBe(5);
  });

  it('should fail due to missing element', () => {
    render(<Button>Test Button</Button>);
    // This will fail because the text doesn't exist
    expect(screen.getByText('Non-existent button text')).toBeInTheDocument();
  });

  it('should fail due to incorrect assertion', () => {
    const result = Math.random();
    // This will fail because the assertion is wrong
    expect(result).toBeGreaterThan(1.0);
  });

  it('should be flaky due to timing issues', async () => {
    // This test will fail approximately 30% of the time due to timing
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    const endTime = Date.now();
    
    // This assertion might fail if timing is too fast
    expect(endTime - startTime).toBeGreaterThan(100);
  });

  it('should be flaky due to network simulation', async () => {
    // Mock fetch to fail 25% of the time
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    if (Math.random() < 0.25) {
      mockFetch.mockRejectedValue(new Error('Simulated network failure'));
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
      // This will fail when network error occurs
      expect(error).toBeUndefined();
    }
  });

  it('should be flaky due to environment dependencies', () => {
    // This test will fail if certain conditions aren't met
    const currentHour = new Date().getHours();
    // Will fail approximately 50% of the time depending on when tests run
    expect(currentHour).toBeLessThan(12);
  });

  it('should fail due to async timeout', async () => {
    // This test will fail due to timeout
    const promise = new Promise((resolve) => {
      setTimeout(resolve, 10000); // 10 second delay
    });
    
    await expect(promise).resolves.toBeDefined();
  }, 1000); // 1 second timeout

  it('should fail due to exception', () => {
    // This test will fail due to an exception
    const obj: any = null;
    expect(obj.someProperty).toBeDefined();
  });

  it('should be flaky due to race conditions', async () => {
    // Multiple async operations that might race
    const promises = Array.from({ length: 5 }, (_, i) => 
      new Promise(resolve => setTimeout(() => resolve(i), Math.random() * 100))
    );
    
    const results = await Promise.all(promises);
    
    // This might fail due to race conditions
    expect(results).toEqual([0, 1, 2, 3, 4]);
  });

  it('should fail due to strict validation', () => {
    // Very strict validation that might fail
    const email = 'test@example.com';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(regex.test(email)).toBe(true);
    
    // This assertion is too strict and will fail
    expect(email).toHaveLength(16);
  });
});
