import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

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

export async function GET(): Promise<NextResponse> {
  return Sentry.startSpan({ name: "dashboard.load", op: "app.dashboard" }, async (span): Promise<NextResponse> => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        span.setStatus({ code: 1, message: "Unauthorized" });
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      span.setAttributes({
        "user.email": session.user!.email || "unknown",
        "dashboard.operation": "load"
      });

      const user = await Sentry.startSpan({ name: "user.lookup", op: "db.query" }, async (userSpan) => {
        const user = await prisma.user.findUnique({
          where: { email: session.user!.email! },
        });
        userSpan.setAttributes({
          "user.email": session.user!.email || "unknown",
          "user.found": !!user
        });
        return user;
      });

      if (!user) {
        span.setStatus({ code: 1, message: "User not found" });
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get current date and calculate start of current week and last week
      const now = new Date();
      const startOfCurrentWeek = getStartOfWeek(now);
      const startOfLastWeek = new Date(startOfCurrentWeek);
      startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7);

      span.setAttributes({
        "dashboard.week_start": startOfCurrentWeek.toISOString(),
        "dashboard.last_week_start": startOfLastWeek.toISOString()
      });

      // Get activities for current week and last week
      const [thisWeekActivities, lastWeekActivities] = await Sentry.startSpan({ name: "activities.fetch_weekly", op: "db.query" }, async (fetchSpan) => {
        const [thisWeek, lastWeek] = await Promise.all([
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
        
        fetchSpan.setAttributes({
          "activities.this_week_count": thisWeek.length,
          "activities.last_week_count": lastWeek.length,
          "activities.user_id": user.id || "unknown"
        });
        
        return [thisWeek, lastWeek];
      });

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
      const thisWeek = await Sentry.startSpan({ name: "dashboard.calculate_this_week", op: "compute" }, async (thisWeekSpan) => {
        const thisWeek = {
          totalCalories: thisWeekActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0),
          avgDailyCalories: Math.round(
            thisWeekActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0) / 7
          ),
          totalDuration: thisWeekActivities.reduce((sum, activity) => sum + activity.duration, 0),
          daysWithActivity: new Set(thisWeekActivities.map((a) => new Date(a.date).getDay())).size,
          daily: dailyThisWeek,
        };
        
        thisWeekSpan.setAttributes({
          "dashboard.this_week.total_calories": thisWeek.totalCalories,
          "dashboard.this_week.total_duration": thisWeek.totalDuration,
          "dashboard.this_week.days_with_activity": thisWeek.daysWithActivity
        });
        
        return thisWeek;
      });

      // Calculate totals for last week
      const lastWeek = await Sentry.startSpan({ name: "dashboard.calculate_last_week", op: "compute" }, async (lastWeekSpan) => {
        const lastWeek = {
          totalCalories: lastWeekActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0),
          avgDailyCalories: Math.round(
            lastWeekActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0) / 7
          ),
          totalDuration: lastWeekActivities.reduce((sum, activity) => sum + activity.duration, 0),
          daysWithActivity: new Set(lastWeekActivities.map((a) => new Date(a.date).getDay())).size,
          daily: dailyLastWeek,
        };
        
        lastWeekSpan.setAttributes({
          "dashboard.last_week.total_calories": lastWeek.totalCalories,
          "dashboard.last_week.total_duration": lastWeek.totalDuration,
          "dashboard.last_week.days_with_activity": lastWeek.daysWithActivity
        });
        
        return lastWeek;
      });

      span.setAttributes({
        "dashboard.this_week.total_calories": thisWeek.totalCalories,
        "dashboard.last_week.total_calories": lastWeek.totalCalories,
        "dashboard.this_week.days_with_activity": thisWeek.daysWithActivity,
        "dashboard.last_week.days_with_activity": lastWeek.daysWithActivity
      });

      span.setStatus({ code: 0, message: "Success" });
      return NextResponse.json({
        thisWeek,
        lastWeek,
      });
    });
} 