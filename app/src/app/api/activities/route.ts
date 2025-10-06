import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { PrismaClient, ActivityType, EffortLevel } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

const prisma = new PrismaClient();

// MET values for activity type and effort (simplified example)
const METS: Record<ActivityType, Record<EffortLevel | "default", number>> = {
  walking: { easy: 2.5, moderate: 3.5, hard: 4.5, default: 3.5 },
  running: { easy: 7, moderate: 9, hard: 11, default: 9 },
  cycling: { easy: 4, moderate: 6, hard: 8, default: 6 },
  swimming: { easy: 5, moderate: 7, hard: 9, default: 7 },
  weightlifting: { easy: 3, moderate: 5, hard: 6, default: 5 },
  aerobics: { easy: 4, moderate: 6, hard: 8, default: 6 },
  yoga: { easy: 2, moderate: 3, hard: 4, default: 3 },
  hiking: { easy: 5, moderate: 6, hard: 7, default: 6 },
  dancing: { easy: 3, moderate: 5, hard: 7, default: 5 },
  other: { easy: 3, moderate: 4, hard: 5, default: 4 },
};

function calculateCalories({
  type,
  effort,
  duration,
  weight,
}: {
  type: ActivityType;
  effort?: EffortLevel | null;
  duration: number;
  weight: number;
}): number {
  const met = METS[type][effort || "default"] || 4;
  return Math.round((duration * met * weight) / 200);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return Sentry.startSpan({ name: "activity.create", op: "db.operation" }, async (span): Promise<NextResponse> => {
      const session = await getServerSession(authOptions);
      if (!session || !session.user?.email) {
        span.setStatus({ code: 1, message: "Unauthorized" });
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      span.setAttributes({
        "user.email": session.user!.email || "unknown",
        "activity.operation": "create"
      });

      const body = await req.json();
      const { type, effort, date, duration, distance, notes } = body;

      span.setAttributes({
        "activity.type": type,
        "activity.effort": effort || "default",
        "activity.duration": duration || 0,
        "activity.distance": distance || 0
      });

      // Get user and weight
      const user = await Sentry.startSpan({ name: "user.lookup", op: "db.query" }, async (userSpan) => {
        const user = await prisma.user.findUnique({
          where: { email: session.user!.email! },
          include: { profile: true },
        });
        userSpan.setAttributes({
          "user.email": session.user!.email || "unknown",
          "user.found": !!user,
          "user.has_profile": !!user?.profile
        });
        return user;
      });

      if (!user) {
        span.setStatus({ code: 1, message: "User not found" });
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const weight = user.profile?.weight || 70; // default to 70kg if not set

      // Calculate calories
      const calories = await Sentry.startSpan({ name: "calories.calculate", op: "compute" }, async (calSpan) => {
        const calories = calculateCalories({
          type,
          effort,
          duration: Number(duration),
          weight,
        });
        calSpan.setAttributes({
          "calories.calculated": calories,
          "calories.weight_used": weight,
          "calories.met_value": 4 // Simplified for span attributes
        });
        return calories;
      });

      // Save activity
      // Parse date as local date to avoid timezone offset issues
      let parsedDate: Date;
      if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split("-").map(Number);
        parsedDate = new Date(year, month - 1, day);
      } else {
        parsedDate = new Date(date);
      }

      const activity = await Sentry.startSpan({ name: "activity.save", op: "db.insert" }, async (saveSpan) => {
        const activity = await prisma.activity.create({
          data: {
            userId: user.id,
            type,
            effort,
            date: parsedDate,
            duration: Number(duration),
            distance: distance ? Number(distance) : null,
            notes,
            calories,
          },
        });
        saveSpan.setAttributes({
          "activity.id": activity.id,
          "activity.calories": activity.calories || 0,
          "activity.duration": activity.duration || 0
        });
        return activity;
      });

      span.setStatus({ code: 0, message: "Success" });
      return NextResponse.json({ activity });
    });
}

export async function GET(): Promise<NextResponse> {
  return Sentry.startSpan({ name: "activity.list", op: "db.query" }, async (span): Promise<NextResponse> => {
      try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
          span.setStatus({ code: 1, message: "Unauthorized" });
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        span.setAttributes({
          "user.email": session.user!.email || "unknown",
          "activity.operation": "list"
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
          span.setAttributes({ "activities.count": 0 });
          return NextResponse.json({ activities: [] });
        }

        const activities = await Sentry.startSpan({ name: "activities.fetch", op: "db.query" }, async (fetchSpan) => {
          const activities = await prisma.activity.findMany({
            where: {
              userId: user.id,
            },
            orderBy: {
              date: "desc",
            },
          });
          fetchSpan.setAttributes({
            "activities.count": activities.length,
            "activities.user_id": user.id || "unknown"
          });
          return activities;
        });

        span.setAttributes({ "activities.count": activities.length });
        span.setStatus({ code: 0, message: "Success" });
        return NextResponse.json(activities);
      } catch (error) {
        span.setStatus({ code: 2, message: "Internal Server Error" });
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }
    });
} 