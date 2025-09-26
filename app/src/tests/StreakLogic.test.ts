// Test the streak calculation logic
describe('Streak Logic', () => {
  // Mock activity data for testing
  const createMockActivity = (date: string, type: string = 'running') => ({
    id: Math.random().toString(),
    type,
    date: new Date(date),
    duration: 30,
    calories: 300,
  });

  const calculateStreak = (activities: any[]) => {
    // Group activities by date
    const activitiesByDate = new Map();
    activities.forEach(activity => {
      const dateString = new Date(activity.date).toISOString().split('T')[0];
      if (!activitiesByDate.has(dateString)) {
        activitiesByDate.set(dateString, []);
      }
      activitiesByDate.get(dateString).push(activity);
    });

    const daysWithActivity = activitiesByDate.size;
    const totalActivities = activities.length;
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
    const totalCalories = activities.reduce((sum, activity) => sum + (activity.calories || 0), 0);
    const hasStreak = daysWithActivity >= 4;

    let streakMessage = '';
    if (hasStreak) {
      streakMessage = `🔥 Amazing! You've worked out ${daysWithActivity} days this week!`;
    } else if (daysWithActivity >= 2) {
      streakMessage = `💪 Great progress! You've worked out ${daysWithActivity} days this week. Keep it up!`;
    } else if (daysWithActivity >= 1) {
      streakMessage = `🎯 Good start! You've worked out ${daysWithActivity} day this week.`;
    } else {
      streakMessage = `🚀 Ready to start your fitness journey? Log your first activity!`;
    }

    return {
      daysWithActivity,
      totalActivities,
      totalDuration,
      totalCalories,
      hasStreak,
      streakMessage,
    };
  };

  it('should calculate streak correctly for 5 days (streak achieved)', () => {
    const activities = [
      createMockActivity('2024-01-15T10:00:00Z'),
      createMockActivity('2024-01-16T10:00:00Z'),
      createMockActivity('2024-01-17T10:00:00Z'),
      createMockActivity('2024-01-18T10:00:00Z'),
      createMockActivity('2024-01-19T10:00:00Z'),
    ];

    const result = calculateStreak(activities);

    expect(result.daysWithActivity).toBe(5);
    expect(result.hasStreak).toBe(true);
    expect(result.totalActivities).toBe(5);
    expect(result.totalDuration).toBe(150); // 5 * 30 minutes
    expect(result.totalCalories).toBe(1500); // 5 * 300 calories
    expect(result.streakMessage).toContain('Amazing!');
    expect(result.streakMessage).toContain('5 days');
  });

  it('should calculate streak correctly for 3 days (no streak)', () => {
    const activities = [
      createMockActivity('2024-01-15T10:00:00Z'),
      createMockActivity('2024-01-16T10:00:00Z'),
      createMockActivity('2024-01-17T10:00:00Z'),
    ];

    const result = calculateStreak(activities);

    expect(result.daysWithActivity).toBe(3);
    expect(result.hasStreak).toBe(false);
    expect(result.totalActivities).toBe(3);
    expect(result.totalDuration).toBe(90); // 3 * 30 minutes
    expect(result.totalCalories).toBe(900); // 3 * 300 calories
    expect(result.streakMessage).toContain('Great progress');
    expect(result.streakMessage).toContain('3 days');
  });

  it('should calculate streak correctly for 1 day', () => {
    const activities = [
      createMockActivity('2024-01-15T10:00:00Z'),
    ];

    const result = calculateStreak(activities);

    expect(result.daysWithActivity).toBe(1);
    expect(result.hasStreak).toBe(false);
    expect(result.totalActivities).toBe(1);
    expect(result.totalDuration).toBe(30);
    expect(result.totalCalories).toBe(300);
    expect(result.streakMessage).toContain('Good start');
    expect(result.streakMessage).toContain('1 day');
  });

  it('should calculate streak correctly for 0 days', () => {
    const activities: any[] = [];

    const result = calculateStreak(activities);

    expect(result.daysWithActivity).toBe(0);
    expect(result.hasStreak).toBe(false);
    expect(result.totalActivities).toBe(0);
    expect(result.totalDuration).toBe(0);
    expect(result.totalCalories).toBe(0);
    expect(result.streakMessage).toContain('Ready to start');
  });

  it('should handle multiple activities on the same day', () => {
    const activities = [
      createMockActivity('2024-01-15T10:00:00Z', 'running'),
      createMockActivity('2024-01-15T18:00:00Z', 'cycling'), // Same day
      createMockActivity('2024-01-16T10:00:00Z', 'weightlifting'),
      createMockActivity('2024-01-17T10:00:00Z', 'yoga'),
      createMockActivity('2024-01-18T10:00:00Z', 'swimming'),
    ];

    const result = calculateStreak(activities);

    expect(result.daysWithActivity).toBe(4); // Should count as 4 unique days
    expect(result.hasStreak).toBe(true); // 4 days = streak achieved
    expect(result.totalActivities).toBe(5); // Total activities
    expect(result.totalDuration).toBe(150); // 5 * 30 minutes
    expect(result.totalCalories).toBe(1500); // 5 * 300 calories
  });

  it('should handle exactly 4 days (streak threshold)', () => {
    const activities = [
      createMockActivity('2024-01-15T10:00:00Z'),
      createMockActivity('2024-01-16T10:00:00Z'),
      createMockActivity('2024-01-17T10:00:00Z'),
      createMockActivity('2024-01-18T10:00:00Z'),
    ];

    const result = calculateStreak(activities);

    expect(result.daysWithActivity).toBe(4);
    expect(result.hasStreak).toBe(true); // Exactly 4 days should trigger streak
    expect(result.streakMessage).toContain('Amazing!');
  });
});
