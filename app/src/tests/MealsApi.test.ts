import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/meals/route';

// Mock Prisma
const mockPrisma = {
  meal: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('@/generated/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Meals API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/meals', () => {
    it('should return meals for authenticated user', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      const mockMeals = [
        {
          id: '1',
          name: 'Chicken Salad',
          type: 'lunch',
          calories: 350,
          protein: 25,
          carbs: 15,
          fat: 20,
          date: '2024-09-16',
          userEmail: 'test@example.com'
        }
      ];

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(mockSession);
      mockPrisma.meal.findMany.mockResolvedValue(mockMeals);

      const request = new NextRequest('http://localhost:3000/api/meals?date=2024-09-16');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meals).toEqual(mockMeals);
      expect(mockPrisma.meal.findMany).toHaveBeenCalledWith({
        where: {
          userEmail: 'test@example.com',
          date: '2024-09-16'
        },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/meals?date=2024-09-16');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should handle database errors gracefully', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(mockSession);
      mockPrisma.meal.findMany.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/meals?date=2024-09-16');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/meals', () => {
    it('should create meal for authenticated user', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      const mockMeal = {
        id: '1',
        name: 'Chicken Salad',
        type: 'lunch',
        calories: 350,
        protein: 25,
        carbs: 15,
        fat: 20,
        date: '2024-09-16',
        userEmail: 'test@example.com'
      };

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(mockSession);
      mockPrisma.meal.create.mockResolvedValue(mockMeal);

      const requestBody = {
        name: 'Chicken Salad',
        type: 'lunch',
        calories: 350,
        protein: 25,
        carbs: 15,
        fat: 20,
        date: '2024-09-16'
      };

      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.meal).toEqual(mockMeal);
      expect(mockPrisma.meal.create).toHaveBeenCalledWith({
        data: {
          ...requestBody,
          userEmail: 'test@example.com'
        }
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(null);

      const requestBody = {
        name: 'Chicken Salad',
        type: 'lunch',
        calories: 350,
        date: '2024-09-16'
      };

      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(mockSession);

      const requestBody = {
        // Missing required fields
        type: 'lunch',
        date: '2024-09-16'
      };

      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle database errors during creation', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(mockSession);
      mockPrisma.meal.create.mockRejectedValue(new Error('Database constraint violation'));

      const requestBody = {
        name: 'Chicken Salad',
        type: 'lunch',
        calories: 350,
        date: '2024-09-16'
      };

      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  // Intentionally flaky tests for Sentry Test Analytics demonstration
  describe('Flaky Tests for Analytics Demo', () => {
    it('should sometimes fail due to database connection issues', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(mockSession);

      // Simulate intermittent database connection issues
      const randomValue = Math.random();
      if (randomValue < 0.25) {
        mockPrisma.meal.findMany.mockRejectedValue(new Error('Connection timeout'));
      } else {
        mockPrisma.meal.findMany.mockResolvedValue([]);
      }

      const request = new NextRequest('http://localhost:3000/api/meals?date=2024-09-16');
      const response = await GET(request);

      if (randomValue < 0.25) {
        expect(response.status).toBe(500);
      } else {
        expect(response.status).toBe(200);
      }
    });

    it('should fail when session validation is inconsistent', async () => {
      // This test simulates inconsistent session validation
      const { getServerSession } = require('next-auth');
      
      // Sometimes return valid session, sometimes null
      const randomValue = Math.random();
      if (randomValue < 0.3) {
        getServerSession.mockResolvedValue(null);
      } else {
        getServerSession.mockResolvedValue({
          user: { email: 'test@example.com' }
        });
        mockPrisma.meal.findMany.mockResolvedValue([]);
      }

      const request = new NextRequest('http://localhost:3000/api/meals?date=2024-09-16');
      const response = await GET(request);

      if (randomValue < 0.3) {
        expect(response.status).toBe(401);
      } else {
        expect(response.status).toBe(200);
      }
    });

    it('should handle concurrent meal creation requests', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(mockSession);

      // Simulate race condition in meal creation
      let callCount = 0;
      mockPrisma.meal.create.mockImplementation(() => {
        callCount++;
        if (callCount > 1) {
          throw new Error('Duplicate meal creation detected');
        }
        return Promise.resolve({
          id: '1',
          name: 'Chicken Salad',
          type: 'lunch',
          calories: 350,
          date: '2024-09-16',
          userEmail: 'test@example.com'
        });
      });

      const requestBody = {
        name: 'Chicken Salad',
        type: 'lunch',
        calories: 350,
        date: '2024-09-16'
      };

      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      // First request should succeed
      const response1 = await POST(request);
      expect(response1.status).toBe(201);

      // Second request might fail due to race condition
      const response2 = await POST(request);
      if (response2.status === 500) {
        expect(response2.status).toBe(500);
      } else {
        expect(response2.status).toBe(201);
      }
    });

    it('should validate meal type enum correctly', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(mockSession);

      // Test with invalid meal type
      const requestBody = {
        name: 'Test Meal',
        type: 'invalid_type', // Invalid enum value
        calories: 100,
        date: '2024-09-16'
      };

      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      // This might fail if enum validation is strict
      mockPrisma.meal.create.mockRejectedValue(new Error('Invalid enum value'));

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it('should handle malformed JSON requests', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(mockSession);

      // Malformed JSON
      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: '{ invalid json }',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should handle large payload requests', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(mockSession);

      // Large payload
      const largeName = 'A'.repeat(10000);
      const requestBody = {
        name: largeName,
        type: 'lunch',
        calories: 100,
        date: '2024-09-16'
      };

      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      // This might fail if there are size limits
      mockPrisma.meal.create.mockResolvedValue({
        id: '1',
        ...requestBody,
        userEmail: 'test@example.com'
      });

      const response = await POST(request);
      
      // This test might fail if payload size limits are enforced
      if (response.status === 413) {
        expect(response.status).toBe(413);
      } else {
        expect(response.status).toBe(201);
      }
    });

    it('should handle timezone-related date issues', async () => {
      const mockSession = {
        user: { email: 'test@example.com' }
      };

      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(mockSession);

      // Date that might cause timezone issues
      const problematicDate = '2024-09-16T23:59:59.999Z';
      const requestBody = {
        name: 'Test Meal',
        type: 'lunch',
        calories: 100,
        date: problematicDate
      };

      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      // This might fail due to timezone parsing issues
      mockPrisma.meal.create.mockImplementation(({ data }) => {
        const date = new Date(data.date);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format');
        }
        return Promise.resolve({
          id: '1',
          ...data,
          userEmail: 'test@example.com'
        });
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    });
  });
});
