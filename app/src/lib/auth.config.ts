import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';

const prisma = new PrismaClient();

// Dynamically get the port from environment or default to 3000
const getPort = () => {
  if (process.env.PORT) return process.env.PORT;
  if (process.env.NEXTAUTH_URL) {
    const url = new URL(process.env.NEXTAUTH_URL);
    return url.port || '3000';
  }
  return '3000';
};

const port = getPort();
const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${port}`;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: 'smtp.resend.com',
        port: 587,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
        secure: false,
      },
      from: 'onboarding@resend.dev',
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        console.log('🔐 Sending verification email to:', identifier);
        console.log('🔗 Magic link URL:', url);
        console.log('🌐 Base URL:', baseUrl);
        
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          const result = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: identifier,
            subject: 'Sign in to FitFest',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Sign in to FitFest</h1>
                <p style="color: #666; font-size: 16px;">Click the button below to sign in to your FitFest account:</p>
                <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Sign in to FitFest</a>
                <p style="color: #999; font-size: 14px; margin-top: 20px;">If you didn't request this email, you can safely ignore it.</p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">This link will expire in 24 hours.</p>
              </div>
            `,
          });
          
          console.log('✅ Email sent successfully:', result);
        } catch (error) {
          console.error('❌ Failed to send email:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  debug: process.env.NODE_ENV === 'development',
}; 