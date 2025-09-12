import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from '@/components/Button';

describe('Intentionally Failing Tests for Codecov Test Analytics Demo', () => {
  it('should fail to demonstrate test failure analytics', () => {
    // This test will always fail to show how Codecov handles test failures
    expect(true).toBe(false);
  });

  it('should fail due to missing element', () => {
    render(<Button>Test</Button>);
    // This will fail because the element doesn't exist
    expect(screen.getByText('Non-existent text')).toBeInTheDocument();
  });

  it('should fail due to incorrect assertion', () => {
    const result = 2 + 2;
    // This will fail because the assertion is wrong
    expect(result).toBe(5);
  });

  it('should fail due to async operation timeout', async () => {
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
});
