import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Calculate and return streak data
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  try {
    // Get current week's activities
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Get activities for current week
    const weekActivities = await prisma.activity.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
    
    // Calculate unique days with activities this week
    const uniqueDays = new Set();
    weekActivities.forEach(activity => {
      const activityDate = new Date(activity.date);
      const dateString = activityDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      uniqueDays.add(dateString);
    });
    
    const daysWithActivity = uniqueDays.size;
    
    // Calculate streak data
    const streakData = {
      currentWeek: {
        daysWithActivity,
        totalActivities: weekActivities.length,
        totalDuration: weekActivities.reduce((sum, activity) => sum + activity.duration, 0),
        totalCalories: weekActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0),
        hasStreak: daysWithActivity >= 4, // Streak threshold: 4+ days
        streakMessage: daysWithActivity >= 4 
          ? `🔥 Amazing! You've worked out ${daysWithActivity} days this week!`
          : daysWithActivity >= 2
          ? `💪 Great progress! You've worked out ${daysWithActivity} days this week. Keep it up!`
          : daysWithActivity >= 1
          ? `🎯 Good start! You've worked out ${daysWithActivity} day this week.`
          : `🚀 Ready to start your fitness journey? Log your first activity!`,
        activitiesByDay: weekActivities.reduce((acc, activity) => {
          const dateString = new Date(activity.date).toISOString().split('T')[0];
          if (!acc[dateString]) {
            acc[dateString] = [];
          }
          acc[dateString].push(activity);
          return acc;
        }, {} as Record<string, typeof weekActivities>),
      },
      // Calculate last week for comparison
      lastWeek: await calculateLastWeekStreak(user.id, startOfWeek),
    };
    
    return NextResponse.json({ streak: streakData });
  } catch (error) {
    console.error('Error calculating streak:', error);
    return NextResponse.json({ error: 'Failed to calculate streak' }, { status: 500 });
  }
}

// Helper function to calculate last week's streak
async function calculateLastWeekStreak(userId: string, currentWeekStart: Date) {
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
  
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
  lastWeekEnd.setHours(23, 59, 59, 999);
  
  const lastWeekActivities = await prisma.activity.findMany({
    where: {
      userId,
      date: {
        gte: lastWeekStart,
        lte: lastWeekEnd,
      },
    },
  });
  
  const uniqueDays = new Set();
  lastWeekActivities.forEach(activity => {
    const activityDate = new Date(activity.date);
    const dateString = activityDate.toISOString().split('T')[0];
    uniqueDays.add(dateString);
  });
  
  return {
    daysWithActivity: uniqueDays.size,
    totalActivities: lastWeekActivities.length,
    totalDuration: lastWeekActivities.reduce((sum, activity) => sum + activity.duration, 0),
    totalCalories: lastWeekActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0),
  };
}
