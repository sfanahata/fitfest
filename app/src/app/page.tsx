"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to FitFest
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your personal fitness journey starts here. Track, share, and achieve your fitness goals.
        </p>
        {session ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Welcome, {session.user?.email}!</h2>
            <Link href="/dashboard">
              <span className="text-blue-600 underline hover:text-blue-800 cursor-pointer">Go to Dashboard</span>
            </Link>
          </div>
        ) : (
          <Link href="/auth/signin">
            <span className="text-blue-600 underline hover:text-blue-800 cursor-pointer">Sign in to your account</span>
          </Link>
        )}
      </div>
    </div>
  );
}
