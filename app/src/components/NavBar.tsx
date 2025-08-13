"use client";
import Link from "next/link";
import Button from "@/components/Button";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Session {
  user?: {
    email?: string;
  };
}

export default function NavBar() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Get session data
  useEffect(() => {
    async function getSession() {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
        }
      } catch (error) {
        console.log('Session fetch failed:', error);
      } finally {
        setLoading(false);
      }
    }
    
    getSession();
  }, []);

  return (
    <nav className="w-full flex items-center justify-between p-4 bg-gray-100 shadow-sm sticky top-0 z-50">
      <div className="flex gap-4 items-center">
        <Link href="/">
          <span className={`font-semibold text-lg hover:underline ${
            pathname === "/" ? "text-blue-700 underline" : "text-gray-700"
          }`}>
            Home
          </span>
        </Link>
        <Link href="/activities">
          <span className={`hover:underline ${
            pathname.startsWith("/activities") ? "text-blue-700 underline" : "text-gray-700"
          }`}>
            Activities
          </span>
        </Link>
        <Link href="/nutrition">
          <span className={`hover:underline ${
            pathname.startsWith("/nutrition") ? "text-blue-700 underline" : "text-gray-700"
          }`}>
            Nutrition
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/profile">
          <Button className="bg-gray-400 text-gray-900 hover:bg-gray-500 px-3 py-2 rounded">
            Profile
          </Button>
        </Link>
        {session?.user ? (
          <a href="/api/auth/signout">
            <Button className="bg-red-500 text-white hover:bg-red-600">
              Sign out
            </Button>
          </a>
        ) : (
          <a href="/api/auth/signin">
            <Button className="bg-blue-500 text-white hover:bg-blue-600">
              Sign in
            </Button>
          </a>
        )}
      </div>
    </nav>
  );
} 