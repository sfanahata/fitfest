import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // secret: process.env.NEXTAUTH_SECRET, // Temporarily disabled
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
    }),
  ],
  session: {
    strategy: 'database',
  },
  debug: true,
}; 