import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!resend) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: 'Test Email from FitFest',
      html: '<p>This is a test email to verify Resend is working correctly!</p>',
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
