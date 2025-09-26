import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Button from '@/components/Button';
import Card from '@/components/Card';

/**
 * Sentry Test Analytics Demo Tests
 * 
 * This file contains intentionally failing and flaky tests to demonstrate
 * Sentry's Test Analytics capabilities for tracking test failures and flakiness.
 * 
 * Based on: https://docs.sentry.io/product/test-analytics/#why-use-test-analytics
 */

describe('Sentry Test Analytics - Failed Tests', () => {
  describe('Intentionally Failing Tests', () => {
    it('should fail due to incorrect assertion', () => {
      // This test will always fail to demonstrate failure tracking
      const result = 2 + 2;
      expect(result).toBe(5); // Intentionally wrong
    });

    it('should fail when testing non-existent element', () => {
      render(<Button>Test Button</Button>);
      // This will fail because the element doesn't exist
      expect(screen.getByText('Non-existent Button')).toBeInTheDocument();
    });

    it('should fail due to type mismatch', () => {
      const number = 42;
      expect(number).toBe('42'); // String vs number comparison
    });

    it('should fail when testing undefined behavior', () => {
      const obj: any = null;
      // This will throw an error
      expect(obj.someProperty).toBeDefined();
    });

    it('should fail due to array length mismatch', () => {
      const array = [1, 2, 3];
      expect(array).toHaveLength(5); // Intentionally wrong length
    });
  });

  describe('Network and API Failure Tests', () => {
    it('should fail when API returns error status', async () => {
      // Mock fetch to return error
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const response = await fetch('/api/meals');
      expect(response.ok).toBe(true); // This will fail
    });

    it('should fail when API response is malformed', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' })
      });

      const response = await fetch('/api/profile');
      const data = await response.json();
      expect(data.profile.targetCalories).toBeDefined(); // This will fail
    });

    it('should fail due to timeout', async () => {
      // Mock a slow API response
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'slow response' })
        }), 10000)) // 10 second delay
      );

      // This test will timeout
      const response = await fetch('/api/activities');
      expect(response.ok).toBe(true);
    }, 1000); // 1 second timeout
  });
});

describe('Sentry Test Analytics - Flaky Tests', () => {
  describe('Timing-Based Flaky Tests', () => {
    it('should be flaky due to random timing', () => {
      const random = Math.random();
      // This test will fail ~10% of the time
      expect(random).toBeGreaterThan(0.1);
    });

    it('should be flaky due to race conditions', async () => {
      let counter = 0;
      
      // Simulate race condition
      const promises = Array.from({ length: 5 }, () => 
        new Promise(resolve => {
          setTimeout(() => {
            counter++;
            resolve(counter);
          }, Math.random() * 100);
        })
      );

      await Promise.all(promises);
      // This might fail if race condition occurs
      expect(counter).toBe(5);
    });

    it('should be flaky due to async state updates', async () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        
        React.useEffect(() => {
          const timer = setTimeout(() => setCount(1), Math.random() * 50);
          return () => clearTimeout(timer);
        }, []);

        return <div data-testid="count">{count}</div>;
      };

      render(<TestComponent />);
      
      // This might fail if state update hasn't completed
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      }, { timeout: 100 });
    });
  });

  describe('Environment-Dependent Flaky Tests', () => {
    it('should be flaky based on system time', () => {
      const now = new Date();
      const hour = now.getHours();
      
      // This test will fail during certain hours
      expect(hour).not.toBe(13); // Fails at 1 PM
    });

    it('should be flaky based on memory usage', () => {
      const memoryUsage = process.memoryUsage();
      const heapUsed = memoryUsage.heapUsed;
      
      // This test might fail under high memory pressure
      expect(heapUsed).toBeLessThan(1000000000); // 1GB
    });

    it('should be flaky due to DOM state', () => {
      // Add some DOM manipulation that might affect other tests
      document.body.innerHTML = '<div id="test-element">Test</div>';
      
      render(<Button>Test</Button>);
      const button = screen.getByText('Test');
      
      // This might fail if DOM state is inconsistent
      expect(button).toBeInTheDocument();
      
      // Cleanup
      document.body.innerHTML = '';
    });
  });

  describe('Component-Specific Flaky Tests', () => {
    it('should be flaky when testing button interactions', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      const button = screen.getByText('Click Me');
      
      // Rapid clicking might cause flakiness
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      // This might fail if event handling is inconsistent
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should be flaky when testing card component rendering', () => {
      const TestCard = () => (
        <Card>
          <div data-testid="card-content">
            Content {Math.random()}
          </div>
        </Card>
      );

      render(<TestCard />);
      
      // This might fail if random content doesn't match
      const content = screen.getByTestId('card-content');
      expect(content.textContent).toContain('Content');
    });

    it('should be flaky when testing responsive behavior', () => {
      // Mock different screen sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: Math.random() > 0.5 ? 768 : 1024,
      });

      render(<Button>Responsive Button</Button>);
      const button = screen.getByText('Responsive Button');
      
      // This might fail depending on screen size
      expect(button).toBeInTheDocument();
    });
  });

  describe('Data-Dependent Flaky Tests', () => {
    it('should be flaky when processing user data', () => {
      const users = [
        { id: 1, name: 'John', active: true },
        { id: 2, name: 'Jane', active: Math.random() > 0.5 },
        { id: 3, name: 'Bob', active: false }
      ];

      const activeUsers = users.filter(user => user.active);
      
      // This might fail if Jane's active status is random
      expect(activeUsers.length).toBeGreaterThan(0);
    });

    it('should be flaky when validating form data', () => {
      const formData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: Math.random() > 0.5 ? 'password123' : 'different'
      };

      // This might fail if passwords don't match
      expect(formData.password).toBe(formData.confirmPassword);
    });

    it('should be flaky when testing date calculations', () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      
      // This might fail if date calculation is off by milliseconds
      const timeDiff = tomorrow.getTime() - now.getTime();
      expect(timeDiff).toBe(24 * 60 * 60 * 1000); // Exactly 24 hours
    });
  });
});

describe('Sentry Test Analytics - Performance Tests', () => {
  it('should fail due to slow performance', async () => {
    const startTime = Date.now();
    
    // Simulate slow operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // This will fail because operation took too long
    expect(duration).toBeLessThan(1000);
  });

  it('should be flaky due to variable performance', () => {
    const startTime = Date.now();
    
    // Simulate variable performance operation
    const iterations = Math.floor(Math.random() * 1000000) + 100000;
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += i;
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // This might fail if performance varies significantly
    expect(duration).toBeLessThan(100);
  });
});

describe('Sentry Test Analytics - Integration Tests', () => {
  it('should fail when testing full user flow', async () => {
    // Mock successful API calls
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, name: 'Test User' } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ profile: { targetCalories: 2000 } })
      })
      .mockResolvedValueOnce({
        ok: false, // This will cause the test to fail
        status: 404
      });

    // Simulate user flow
    const userResponse = await fetch('/api/auth/session');
    const userData = await userResponse.json();
    expect(userData.user).toBeDefined();

    const profileResponse = await fetch('/api/profile');
    const profileData = await profileResponse.json();
    expect(profileData.profile).toBeDefined();

    const mealsResponse = await fetch('/api/meals');
    expect(mealsResponse.ok).toBe(true); // This will fail
  });

  it('should be flaky when testing concurrent operations', async () => {
    const promises = Array.from({ length: 10 }, (_, i) => 
      fetch(`/api/activities/${i}`)
    );

    // Mock responses with random success/failure
    global.fetch = jest.fn().mockImplementation((url) => {
      const shouldSucceed = Math.random() > 0.3; // 70% success rate
      return Promise.resolve({
        ok: shouldSucceed,
        status: shouldSucceed ? 200 : 500,
        json: () => Promise.resolve(shouldSucceed ? { data: 'success' } : { error: 'failed' })
      });
    });

    const responses = await Promise.all(promises);
    const successfulResponses = responses.filter(r => r.ok);
    
    // This might fail if too many requests fail
    expect(successfulResponses.length).toBeGreaterThan(5);
  });
});
