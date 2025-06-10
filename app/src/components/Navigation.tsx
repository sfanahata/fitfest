"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Button from "./Button";

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                FitFest
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{session.user?.email}</span>
                <Button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth/signin" passHref legacyBehavior>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 