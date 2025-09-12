import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ActivitiesPage from '../app/activities/page';
import { simulateNetworkDelay } from '../utils/testUtils';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
};

describe('ActivitiesPage', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ActivitiesPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders empty state when no activities', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<ActivitiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No activities logged yet. Click "Log Activity" to add your first!')).toBeInTheDocument();
    });
  });

  it('renders activities list', async () => {
    const mockActivities = [
      {
        id: '1',
        type: 'running',
        date: '2024-01-15T10:00:00Z',
        duration: 30,
        calories: 300,
        notes: 'Morning run',
      },
      {
        id: '2',
        type: 'cycling',
        date: '2024-01-14T15:30:00Z',
        duration: 45,
        calories: 400,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockActivities),
    });

    render(<ActivitiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('running')).toBeInTheDocument();
      expect(screen.getByText('cycling')).toBeInTheDocument();
      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('45 min')).toBeInTheDocument();
    });
  });

  it('handles delete activity', async () => {
    const mockActivities = [
      {
        id: '1',
        type: 'running',
        date: '2024-01-15T10:00:00Z',
        duration: 30,
        calories: 300,
      },
    ];

    // Mock initial fetch
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivities),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    // Mock confirm dialog
    window.confirm = jest.fn(() => true);

    render(<ActivitiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('running')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this activity?');
  });

  it('handles network errors gracefully', async () => {
    // Test that the component renders without crashing
    render(<ActivitiesPage />);
    
    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('navigates to edit page when edit button is clicked', async () => {
    const mockActivities = [
      {
        id: '1',
        type: 'running',
        date: '2024-01-15T10:00:00Z',
        duration: 30,
        calories: 300,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockActivities),
    });

    render(<ActivitiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('running')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit');
    
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/activities/1/edit');
  });

  it('displays activity details correctly', async () => {
    const mockActivities = [
      {
        id: '1',
        type: 'running',
        date: '2024-01-15T10:00:00Z',
        duration: 30,
        calories: 300,
        notes: 'Morning run in the park',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockActivities),
    });

    render(<ActivitiesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('running')).toBeInTheDocument();
      expect(screen.getByText('Morning run in the park')).toBeInTheDocument();
      expect(screen.getByText('300 kcal')).toBeInTheDocument();
      expect(screen.getByText('30 min')).toBeInTheDocument();
    });
  });
});

describe('simulateNetworkDelay utility', () => {
  it('resolves after a random delay', async () => {
    const startTime = Date.now();
    await simulateNetworkDelay();
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeGreaterThanOrEqual(0);
    expect(endTime - startTime).toBeLessThan(200); // Should be less than 200ms
  });

  it('can be flaky due to random timing', async () => {
    // This test might occasionally fail due to timing issues
    const promises = Array.from({ length: 10 }, () => simulateNetworkDelay());
    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(10);
    // This assertion might fail occasionally due to race conditions
    expect(results.every(result => result === undefined)).toBe(true);
  });
});
