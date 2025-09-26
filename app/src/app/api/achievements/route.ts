import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { PrismaClient, AchievementType } from '@prisma/client';

const prisma = new PrismaClient();

// Achievement definitions with metadata
const ACHIEVEMENT_DEFINITIONS = {
  [AchievementType.STREAK_3_DAYS]: {
    name: 'Streak Starter',
    description: 'Work out for 3 days in a row',
    icon: '🔥',
    color: '#ff6b35',
    gradient: 'linear-gradient(135deg, #ff6b35, #f7931e)'
  },
  [AchievementType.STREAK_5_DAYS]: {
    name: 'Consistency King',
    description: 'Work out for 5 days in a row',
    icon: '👑',
    color: '#ffd700',
    gradient: 'linear-gradient(135deg, #ffd700, #ffed4e)'
  },
  [AchievementType.STREAK_7_DAYS]: {
    name: 'Week Warrior',
    description: 'Work out for 7 days in a row',
    icon: '⚔️',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)'
  },
  [AchievementType.STREAK_14_DAYS]: {
    name: 'Fortnight Fighter',
    description: 'Work out for 14 days in a row',
    icon: '🛡️',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
  },
  [AchievementType.STREAK_30_DAYS]: {
    name: 'Monthly Master',
    description: 'Work out for 30 days in a row',
    icon: '🏆',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)'
  },
  [AchievementType.FIRST_WORKOUT]: {
    name: 'First Steps',
    description: 'Complete your first workout',
    icon: '🎯',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
  },
  [AchievementType.WORKOUT_MARATHON]: {
    name: 'Marathon Master',
    description: 'Complete 26 workouts',
    icon: '🏃‍♂️',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
  },
  [AchievementType.CONSISTENCY_CHAMPION]: {
    name: 'Consistency Champion',
    description: 'Work out 4+ days in a week',
    icon: '💪',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
  }
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's achievements
    const achievements = await prisma.achievement.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        earnedAt: 'desc'
      }
    });

    // Transform achievements with metadata
    const achievementsWithMetadata = achievements.map(achievement => ({
      id: achievement.id,
      type: achievement.type,
      count: achievement.count,
      earnedAt: achievement.earnedAt,
      ...ACHIEVEMENT_DEFINITIONS[achievement.type]
    }));

    return NextResponse.json({ achievements: achievementsWithMetadata });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await request.json();

    if (!type || !Object.values(AchievementType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid achievement type' },
        { status: 400 }
      );
    }

    // Check if achievement already exists
    const existingAchievement = await prisma.achievement.findUnique({
      where: {
        userId_type: {
          userId: session.user.id,
          type: type as AchievementType
        }
      }
    });

    if (existingAchievement) {
      // Increment count
      const updatedAchievement = await prisma.achievement.update({
        where: {
          id: existingAchievement.id
        },
        data: {
          count: existingAchievement.count + 1,
          earnedAt: new Date()
        }
      });

      return NextResponse.json({
        achievement: {
          id: updatedAchievement.id,
          type: updatedAchievement.type,
          count: updatedAchievement.count,
          earnedAt: updatedAchievement.earnedAt,
          ...ACHIEVEMENT_DEFINITIONS[updatedAchievement.type]
        }
      });
    } else {
      // Create new achievement
      const newAchievement = await prisma.achievement.create({
        data: {
          userId: session.user.id,
          type: type as AchievementType,
          count: 1
        }
      });

      return NextResponse.json({
        achievement: {
          id: newAchievement.id,
          type: newAchievement.type,
          count: newAchievement.count,
          earnedAt: newAchievement.earnedAt,
          ...ACHIEVEMENT_DEFINITIONS[newAchievement.type]
        }
      });
    }
  } catch (error) {
    console.error('Error creating/updating achievement:', error);
    return NextResponse.json(
      { error: 'Failed to create/update achievement' },
      { status: 500 }
    );
  }
}
