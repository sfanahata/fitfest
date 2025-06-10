import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { PrismaClient, ActivityType, EffortLevel } from "@prisma/client";

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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, effort, date, duration, distance, notes } = body;

  // Get user and weight
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const weight = user.profile?.weight || 70; // default to 70kg if not set

  // Calculate calories
  const calories = calculateCalories({
    type,
    effort,
    duration: Number(duration),
    weight,
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

  return NextResponse.json({ activity });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ activities: [] });
    }

    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 