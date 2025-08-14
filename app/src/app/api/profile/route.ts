import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch current user's profile
export async function GET() {
  const session = await getServerSession(authOptions);
  console.log('Session in GET:', JSON.stringify(session, null, 2));
  
  if (!session?.user?.email) {
    console.log('No session or email found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });
  
  if (!user) {
    console.log('No user found for email:', session.user.email);
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  return NextResponse.json({ 
    profile: user.profile, 
    name: user.name 
  });
}

// POST: Create profile (if not exists)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log('Session in POST:', JSON.stringify(session, null, 2));
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await req.json();
  const { weight, height, name, targetCalories, targetProtein, targetCarbs, targetFat } = body;
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  try {
    // Update user name
    await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });
    
    // Helper function to safely parse numbers
    const safeParseFloat = (value: any) => {
      if (!value || value === '') return null;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    };

    const safeParseInt = (value: any) => {
      if (!value || value === '') return null;
      const parsed = parseInt(value);
      return isNaN(parsed) ? null : parsed;
    };

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        weight: safeParseFloat(weight),
        height: safeParseFloat(height),
        targetCalories: safeParseInt(targetCalories),
        targetProtein: safeParseInt(targetProtein),
        targetCarbs: safeParseInt(targetCarbs),
        targetFat: safeParseInt(targetFat),
      },
      create: {
        userId: user.id,
        weight: safeParseFloat(weight),
        height: safeParseFloat(height),
        targetCalories: safeParseInt(targetCalories),
        targetProtein: safeParseInt(targetProtein),
        targetCarbs: safeParseInt(targetCarbs),
        targetFat: safeParseInt(targetFat),
      },
    });
    
    console.log('Profile saved successfully:', profile);
    return NextResponse.json({ profile, success: true });
  } catch (error) {
    console.error('Profile save error:', error);
    return NextResponse.json(
      { error: 'Failed to save profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT: Update current user's profile
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log('Session in PUT:', JSON.stringify(session, null, 2));
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  const data = await req.json();
  try {
    // First try to update
    try {
      const profile = await prisma.profile.update({
        where: { userId: user.id },
        data: {
          weight: data.weight ? parseFloat(data.weight) : null,
          height: data.height ? parseFloat(data.height) : null,
        },
      });
      return NextResponse.json(profile, { status: 200 });
    } catch {
      // If update fails (profile doesn't exist), create it
      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          weight: data.weight ? parseFloat(data.weight) : null,
          height: data.height ? parseFloat(data.height) : null,
        },
      });
      return NextResponse.json(profile, { status: 201 });
    }
  } catch (error: unknown) {
    console.error('Profile update/create error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 400 });
  }
} 