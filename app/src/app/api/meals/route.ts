import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, date, calories, protein, carbs, fat } = body;

    // Validate required fields
    if (!name || !type || !date || !calories) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, date, calories' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse date as local date to avoid timezone offset issues (same as activities)
    let parsedDate: Date;
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split("-").map(Number);
      parsedDate = new Date(year, month - 1, day);
    } else {
      parsedDate = new Date(date);
    }

    // Create meal
    const meal = await prisma.meal.create({
      data: {
        userId: user.id,
        name,
        type: type as any, // Type assertion for enum
        date: parsedDate,
        calories: parseInt(calories),
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
      }
    });

    return NextResponse.json({ success: true, meal });
  } catch (error) {
    console.error('Error creating meal:', error);
    return NextResponse.json(
      { error: 'Failed to create meal' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If date is provided, get meals for that specific date
    if (date) {
      // Parse date as local date to match how we save meals
      let parsedDate: Date;
      if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split("-").map(Number);
        parsedDate = new Date(year, month - 1, day);
      } else {
        parsedDate = new Date(date);
      }
      
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const meals = await prisma.meal.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return NextResponse.json({ success: true, meals });
    }

    // If no date is provided, get all meals for the user
    const meals = await prisma.meal.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({ success: true, meals });
  } catch (error) {
    console.error('Error fetching meals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meals' },
      { status: 500 }
    );
  }
}
