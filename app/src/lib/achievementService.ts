import { PrismaClient, AchievementType } from '@prisma/client';

const prisma = new PrismaClient();

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: Date | null;
}

export class AchievementService {
  /**
   * Calculate workout streaks for a user
   */
  static async calculateStreaks(userId: string): Promise<StreakData> {
    // Get all activities for the user, ordered by date
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true }
    });

    if (activities.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null
      };
    }

    // Get unique workout dates
    const workoutDates = [...new Set(activities.map(a => a.date.toDateString()))]
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    for (let i = 0; i < workoutDates.length; i++) {
      const workoutDate = new Date(workoutDates[i]);
      workoutDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (workoutDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (let i = 0; i < workoutDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = new Date(workoutDates[i]);
        const previousDate = new Date(workoutDates[i - 1]);
        
        const daysDiff = Math.floor(
          (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastWorkoutDate: workoutDates[0] || null
    };
  }

  /**
   * Check and award streak achievements
   */
  static async checkStreakAchievements(userId: string): Promise<void> {
    const streakData = await this.calculateStreaks(userId);
    
    // Define streak thresholds and their corresponding achievement types
    const streakThresholds = [
      { days: 3, type: AchievementType.STREAK_3_DAYS },
      { days: 5, type: AchievementType.STREAK_5_DAYS },
      { days: 7, type: AchievementType.STREAK_7_DAYS },
      { days: 14, type: AchievementType.STREAK_14_DAYS },
      { days: 30, type: AchievementType.STREAK_30_DAYS }
    ];

    // Check if user has achieved any streak milestones
    for (const threshold of streakThresholds) {
      if (streakData.currentStreak >= threshold.days) {
        await this.awardAchievement(userId, threshold.type);
      }
    }
  }

  /**
   * Check and award consistency achievements (4+ days in a week)
   */
  static async checkConsistencyAchievements(userId: string): Promise<void> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get activities from the last week
    const weeklyActivities = await prisma.activity.findMany({
      where: {
        userId,
        date: {
          gte: oneWeekAgo
        }
      },
      select: { date: true }
    });

    // Count unique days with activities
    const uniqueDays = new Set(
      weeklyActivities.map(activity => activity.date.toDateString())
    ).size;

    // Award consistency achievement if 4+ days
    if (uniqueDays >= 4) {
      await this.awardAchievement(userId, AchievementType.CONSISTENCY_CHAMPION);
    }
  }

  /**
   * Check and award first workout achievement
   */
  static async checkFirstWorkoutAchievement(userId: string): Promise<void> {
    const activityCount = await prisma.activity.count({
      where: { userId }
    });

    if (activityCount >= 1) {
      await this.awardAchievement(userId, AchievementType.FIRST_WORKOUT);
    }
  }

  /**
   * Check and award workout marathon achievement (26 workouts)
   */
  static async checkWorkoutMarathonAchievement(userId: string): Promise<void> {
    const activityCount = await prisma.activity.count({
      where: { userId }
    });

    if (activityCount >= 26) {
      await this.awardAchievement(userId, AchievementType.WORKOUT_MARATHON);
    }
  }

  /**
   * Award an achievement to a user
   */
  static async awardAchievement(userId: string, achievementType: AchievementType): Promise<void> {
    try {
      // Check if achievement already exists
      const existingAchievement = await prisma.achievement.findUnique({
        where: {
          userId_type: {
            userId,
            type: achievementType
          }
        }
      });

      if (existingAchievement) {
        // Increment count and update earned date
        await prisma.achievement.update({
          where: { id: existingAchievement.id },
          data: {
            count: existingAchievement.count + 1,
            earnedAt: new Date()
          }
        });
      } else {
        // Create new achievement
        await prisma.achievement.create({
          data: {
            userId,
            type: achievementType,
            count: 1
          }
        });
      }
    } catch (error) {
      console.error(`Error awarding achievement ${achievementType} to user ${userId}:`, error);
    }
  }

  /**
   * Check all achievements for a user (call this after each workout)
   */
  static async checkAllAchievements(userId: string): Promise<void> {
    await Promise.all([
      this.checkStreakAchievements(userId),
      this.checkConsistencyAchievements(userId),
      this.checkFirstWorkoutAchievement(userId),
      this.checkWorkoutMarathonAchievement(userId)
    ]);
  }
}
