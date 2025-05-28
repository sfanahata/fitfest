import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardPage from '../app/dashboard/page';

// Mock the chart.js dependency
jest.mock('chart.js');

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard'),
}));

// Mock sample data
const mockData = {
  thisWeek: {
    totalCalories: 2500,
    avgDailyCalories: 357,
    totalDuration: 180,
    daysWithActivity: 5,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    durations: [30, 45, 0, 60, 0, 15, 30],
    calories: [400, 600, 0, 800, 0, 300, 400]
  },
  lastWeek: {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    durations: [20, 30, 20, 40, 30, 0, 20],
    calories: [300, 450, 300, 500, 400, 0, 300]
  }
};

// Mock the useDashboardData hook
jest.mock('../hooks/useDashboardData', () => ({
  __esModule: true,
  default: jest.fn(() => ({ 
    data: mockData, 
    isLoading: false, 
    error: null, 
    weekRange: 'May 1 - May 7' 
  }))
}));

describe('DashboardPage Component', () => {
  test('renders dashboard with correct color schemes', () => {
    const { container } = render(<DashboardPage />);
    
    // Test for LineChart colors
    const lineChartConfig = container.querySelector('[data-testid="activity-minutes-chart"]');
    expect(lineChartConfig).toHaveAttribute('data-options');
    
    const lineChartOptions = JSON.parse(lineChartConfig.getAttribute('data-options'));
    expect(lineChartOptions.datasets[0].borderColor).toBe('#93c5fd');
    expect(lineChartOptions.datasets[0].backgroundColor).toBe('#bfdbfe');
    
    // Test for BarChart colors
    const barChartConfig = container.querySelector('[data-testid="calories-chart"]');
    expect(barChartConfig).toHaveAttribute('data-options');
    
    const barChartOptions = JSON.parse(barChartConfig.getAttribute('data-options'));
    expect(barChartOptions.datasets[0].backgroundColor).toBe('#86efac');
    
    // Test for Comparison Chart colors
    const comparisonChartConfig = container.querySelector('[data-testid="comparison-chart"]');
    expect(comparisonChartConfig).toHaveAttribute('data-options');
    
    const comparisonChartOptions = JSON.parse(comparisonChartConfig.getAttribute('data-options'));
    expect(comparisonChartOptions.datasets[0].backgroundColor).toBe('#93c5fd');
    expect(comparisonChartOptions.datasets[1].backgroundColor).toBe('#fcd34d');
  });

  test('renders stat cards with correct color classes', () => {
    render(<DashboardPage />);
    
    // Get all stat card value elements
    const statCards = screen.getAllByText(/^[\d.]+$/);
    
    // Check for total calories text color
    const totalCaloriesElement = screen.getByText(mockData.thisWeek.totalCalories.toString());
    expect(totalCaloriesElement).toHaveClass('text-green-400');
    
    // Check for avg daily calories text color
    const avgDailyCaloriesElement = screen.getByText(mockData.thisWeek.avgDailyCalories.toString());
    expect(avgDailyCaloriesElement).toHaveClass('text-blue-400');
    
    // Check for total duration text color
    const totalDurationElement = screen.getByText(mockData.thisWeek.totalDuration.toString());
    expect(totalDurationElement).toHaveClass('text-indigo-400');
    
    // Check for days with activity text color
    const daysWithActivityElement = screen.getByText(`${mockData.thisWeek.daysWithActivity}/7`);
    expect(daysWithActivityElement).toHaveClass('text-orange-400');
  });

  test('renders tab buttons with correct styles', () => {
    render(<DashboardPage />);
    
    // Get all tab buttons
    const tabButtons = screen.getAllByRole('button');
    
    // First tab should be active by default
    expect(tabButtons[0]).toHaveClass('border-blue-400', 'text-blue-500', 'bg-blue-50');
    
    // Other tabs should be inactive
    expect(tabButtons[1]).toHaveClass('border-transparent', 'text-gray-500', 'bg-gray-50');
    expect(tabButtons[1]).not.toHaveClass('border-blue-400', 'text-blue-500', 'bg-blue-50');
    
    // Test tab switching
    fireEvent.click(tabButtons[1]);
    
    // Now second tab should be active
    expect(tabButtons[1]).toHaveClass('border-blue-400', 'text-blue-500', 'bg-blue-50');
    
    // And first tab should be inactive
    expect(tabButtons[0]).toHaveClass('border-transparent', 'text-gray-500', 'bg-gray-50');
    expect(tabButtons[0]).not.toHaveClass('border-blue-400', 'text-blue-500', 'bg-blue-50');
  });

  test('tab button hover style is applied', () => {
    render(<DashboardPage />);
    
    // Get inactive tab button
    const inactiveTabButton = screen.getAllByRole('button')[1];
    
    // Verify it has the correct hover class
    expect(inactiveTabButton).toHaveClass('hover:bg-gray-100');
    expect(inactiveTabButton).not.toHaveClass('hover:bg-gray-200');
  });
});