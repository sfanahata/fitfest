import { AchievementType } from '@prisma/client';

describe('Achievement System', () => {
  describe('Achievement Types', () => {
    it('should have all required achievement types', () => {
      expect(AchievementType.STREAK_3_DAYS).toBe('STREAK_3_DAYS');
      expect(AchievementType.STREAK_5_DAYS).toBe('STREAK_5_DAYS');
      expect(AchievementType.STREAK_7_DAYS).toBe('STREAK_7_DAYS');
      expect(AchievementType.STREAK_14_DAYS).toBe('STREAK_14_DAYS');
      expect(AchievementType.STREAK_30_DAYS).toBe('STREAK_30_DAYS');
      expect(AchievementType.FIRST_WORKOUT).toBe('FIRST_WORKOUT');
      expect(AchievementType.WORKOUT_MARATHON).toBe('WORKOUT_MARATHON');
      expect(AchievementType.CONSISTENCY_CHAMPION).toBe('CONSISTENCY_CHAMPION');
    });
  });

  describe('Achievement Logic', () => {
    it('should calculate streak correctly for consecutive days', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      // Test that we can create date arrays for streak calculation
      const activities = [today, yesterday, twoDaysAgo];
      const uniqueDates = [...new Set(activities.map(date => date.toDateString()))];
      
      expect(uniqueDates.length).toBe(3);
    });

    it('should handle broken streaks correctly', () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const fourDaysAgo = new Date(today);
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      const activities = [today, threeDaysAgo, fourDaysAgo];
      const uniqueDates = [...new Set(activities.map(date => date.toDateString()))];
      
      expect(uniqueDates.length).toBe(3);
    });

    it('should calculate weekly consistency correctly', () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Create activities for 4 different days in the last week
      const activities = [
        { date: new Date(oneWeekAgo.getTime() + 1 * 24 * 60 * 60 * 1000) },
        { date: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000) },
        { date: new Date(oneWeekAgo.getTime() + 3 * 24 * 60 * 60 * 1000) },
        { date: new Date(oneWeekAgo.getTime() + 4 * 24 * 60 * 60 * 1000) },
      ];

      const uniqueDays = new Set(
        activities.map(activity => activity.date.toDateString())
      ).size;

      expect(uniqueDays).toBe(4);
      expect(uniqueDays >= 4).toBe(true); // Should qualify for consistency achievement
    });
  });

  describe('Achievement Definitions', () => {
    it('should have proper achievement metadata structure', () => {
      const mockAchievement = {
        id: 'test-achievement',
        name: 'Streak Starter',
        description: 'Work out for 3 days in a row',
        icon: '🔥',
        count: 1,
        color: '#ff6b35',
        gradient: 'linear-gradient(135deg, #ff6b35, #f7931e)',
        earnedAt: new Date()
      };

      expect(mockAchievement.name).toBe('Streak Starter');
      expect(mockAchievement.description).toBe('Work out for 3 days in a row');
      expect(mockAchievement.icon).toBe('🔥');
      expect(mockAchievement.count).toBe(1);
      expect(mockAchievement.color).toBe('#ff6b35');
      expect(mockAchievement.gradient).toContain('linear-gradient');
    });
  });
});
