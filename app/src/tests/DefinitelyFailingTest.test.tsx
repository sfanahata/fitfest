import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from '@/components/Button';

describe('Definitely Failing Tests for Test Analytics Demo', () => {
  it('should fail due to incorrect math', () => {
    // This test will always fail to demonstrate failure detection
    expect(1 + 1).toBe(3);
  });

  it('should fail due to wrong string comparison', () => {
    const message = 'Hello, World!';
    expect(message).toBe('Goodbye, World!');
  });

  it('should fail due to missing DOM element', () => {
    render(<Button>Click Me</Button>);
    // This will fail because the text doesn't exist
    expect(screen.getByText('Click Me Not')).toBeInTheDocument();
  });

  it('should fail due to array comparison', () => {
    const array = [1, 2, 3];
    expect(array).toEqual([1, 2, 3, 4]);
  });

  it('should fail due to object property check', () => {
    const obj = { name: 'John', age: 30 };
    expect(obj).toHaveProperty('email');
  });

  it('should fail due to async operation timeout', async () => {
    // This will timeout and fail
    await new Promise(resolve => setTimeout(resolve, 2000));
    expect(true).toBe(true);
  }, 100); // 100ms timeout

  it('should fail due to exception handling', () => {
    const obj: any = null;
    // This will throw an exception
    expect(obj.nonExistentProperty.value).toBeDefined();
  });

  it('should fail due to regex mismatch', () => {
    const email = 'invalid-email';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(email)).toBe(true);
  });

  it('should fail due to type assertion', () => {
    const value: number = 42;
    expect(value).toBe('42');
  });

  it('should fail due to promise rejection', async () => {
    const promise = Promise.reject(new Error('Intentional failure'));
    await expect(promise).resolves.toBe('success');
  });
});
