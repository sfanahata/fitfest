import { NextRequest } from 'next/server';
import middleware, { config } from '../middleware';
import { withAuth } from 'next-auth/middleware';

// Mock next-auth middleware
jest.mock('next-auth/middleware', () => ({
  withAuth: jest.fn((options) => {
    return jest.fn((req) => {
      // Mock middleware behavior
      const token = req.headers.get('authorization');
      const isAuthorized = options.callbacks.authorized({ token });
      if (!isAuthorized) {
        return new Response('Unauthorized', { status: 401 });
      }
      return new Response('OK', { status: 200 });
    });
  }),
}));

describe('Middleware', () => {
  describe('config.matcher', () => {
    it('includes profile paths in matcher', () => {
      expect(config.matcher).toContain('/profile/:path*');
    });

    it('includes activities paths in matcher', () => {
      expect(config.matcher).toContain('/activities/:path*');
    });

    it('does not include dashboard paths in matcher', () => {
      expect(config.matcher).not.toContain('/dashboard/:path*');
    });

    it('does not include settings paths in matcher', () => {
      expect(config.matcher).not.toContain('/settings/:path*');
    });

    it('has exactly 2 protected routes', () => {
      expect(config.matcher).toHaveLength(2);
    });
  });

  it('uses withAuth with correct authorized callback', () => {
    expect(withAuth).toHaveBeenCalledWith({
      callbacks: {
        authorized: expect.any(Function),
      },
    });
  });
});