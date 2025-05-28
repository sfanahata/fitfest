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
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        activities: {
          orderBy: {
            date: "desc",
          },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const startOfLastWeek = getStartOfLastWeek(now);

    // All time stats
    const allTime = await prisma.activity.aggregate({
      where: { userId: user.id },
      _count: { id: true },
      _sum: { duration: true },
    });

    // This week stats
    const thisWeek = await prisma.activity.aggregate({
      where: {
        userId: user.id,
        date: { gte: startOfWeek },
      },
      _count: { id: true },
      _sum: { duration: true, calories: true, distance: true },
    });

    // Fetch all activities for this week and last week
    const activitiesThisWeek = await prisma.activity.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfWeek },
      },
    });
    const activitiesLastWeek = await prisma.activity.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfLastWeek, lt: startOfWeek },
      },
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
        };
      });
      activities.forEach((a) => {
        const d = new Date(a.date);
        d.setHours(0, 0, 0, 0);
        const idx = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (idx >= 0 && idx < 7) {
          days[idx].duration += a.duration || 0;
          days[idx].calories += a.calories || 0;
        }
      });
      return days;
    }

    const dailyThisWeek = getDailyStats(activitiesThisWeek, startOfWeek);
    const dailyLastWeek = getDailyStats(activitiesLastWeek, startOfLastWeek);

    // Calculate average daily calories and days with activity
    const totalCalories = thisWeek._sum.calories || 0;
    const avgDailyCalories = Math.round(totalCalories / 7);
    const daysWithActivity = dailyThisWeek.filter(d => d.duration > 0).length;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        recentActivities: user.activities,
      },
      allTime: {
        totalActivities: allTime._count.id,
        totalDuration: allTime._sum.duration || 0,
      },
      thisWeek: {
        totalActivities: thisWeek._count.id,
        totalDuration: thisWeek._sum.duration || 0,
        totalCalories,
        avgDailyCalories,
        daysWithActivity,
        daily: dailyThisWeek,
      },
      lastWeek: {
        daily: dailyLastWeek,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 