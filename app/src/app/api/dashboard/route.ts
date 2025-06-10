import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day); // Go back to previous Sunday
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfLastWeek(date: Date) {
  const startOfThisWeek = getStartOfWeek(date);
  const d = new Date(startOfThisWeek);
  d.setDate(d.getDate() - 7);
  return d;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get current date and calculate start of current week and last week
  const now = new Date();
  const startOfCurrentWeek = getStartOfWeek(now);
  const startOfLastWeek = new Date(startOfCurrentWeek);
  startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7);

  // Get activities for current week and last week
  const [thisWeekActivities, lastWeekActivities] = await Promise.all([
    prisma.activity.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfCurrentWeek,
          lt: now,
        },
      },
    }),
    prisma.activity.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfLastWeek,
          lt: startOfCurrentWeek,
        },
      },
    }),
  ]);

  // Build daily breakdowns (Monday-Sunday)
  function getDailyStats(activities: any[], start: Date) {
    const days = Array(7).fill(0).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return {
        date: d.toISOString(),
        duration: 0,
        calories: 0,
        activities: 0,
      };
    });

    activities.forEach((a) => {
      const d = new Date(a.date);
      d.setHours(0, 0, 0, 0);
      const idx = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (idx >= 0 && idx < 7) {
        days[idx].duration += a.duration || 0;
        days[idx].calories += a.calories || 0;
        days[idx].activities += 1;
      }
    });

    return days;
  }

  const dailyThisWeek = getDailyStats(thisWeekActivities, startOfCurrentWeek);
  const dailyLastWeek = getDailyStats(lastWeekActivities, startOfLastWeek);

  // Calculate totals for this week
  const thisWeek = {
    totalCalories: thisWeekActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0),
    avgDailyCalories: Math.round(
      thisWeekActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0) / 7
    ),
    totalDuration: thisWeekActivities.reduce((sum, activity) => sum + activity.duration, 0),
    daysWithActivity: new Set(thisWeekActivities.map((a) => new Date(a.date).getDay())).size,
    daily: dailyThisWeek,
  };

  // Calculate totals for last week
  const lastWeek = {
    totalCalories: lastWeekActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0),
    avgDailyCalories: Math.round(
      lastWeekActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0) / 7
    ),
    totalDuration: lastWeekActivities.reduce((sum, activity) => sum + activity.duration, 0),
    daysWithActivity: new Set(lastWeekActivities.map((a) => new Date(a.date).getDay())).size,
    daily: dailyLastWeek,
  };

  return NextResponse.json({
    thisWeek,
    lastWeek,
  });
} 