"use client";
import Link from "next/link";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Session {
  user?: {
    email?: string;
  };
}

interface ProfileData {
  name?: string;
  profile?: any;
}

export default function NavBar() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get session and profile data
  useEffect(() => {
    async function getSessionAndProfile() {
      try {
        const [sessionResponse, profileResponse] = await Promise.all([
          fetch('/api/auth/session', {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache'
            }
          }),
          fetch('/api/profile', {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache'
            }
          })
        ]);
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setSession(sessionData);
        }
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfileData(profileData);
        }
      } catch (error) {
        console.log('Session/Profile fetch failed:', error);
      } finally {
        setLoading(false);
      }
    }
    
    getSessionAndProfile();
  }, []);

  return (
    <nav className="w-full flex items-center justify-between p-4 bg-fitfest-light shadow-sm sticky top-0 z-50 border-b border-fitfest-subtle/20">
      <div className="flex gap-6 items-center">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="lg" showText={false} variant="default" />
          <span className="font-bold text-fitfest-deep text-lg">fitfest</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/">
            <span className={`font-semibold text-lg hover:underline transition-colors ${
              pathname === "/" ? "text-fitfest-bright underline" : "text-fitfest-text hover:text-fitfest-bright"
            }`}>
              Home
            </span>
          </Link>
          <Link href="/activities">
            <span className={`hover:underline transition-colors ${
              pathname.startsWith("/activities") ? "text-fitfest-bright underline" : "text-fitfest-text hover:text-fitfest-bright"
            }`}>
              Activities
            </span>
          </Link>
          <Link href="/nutrition">
            <span className={`hover:underline transition-colors ${
              pathname.startsWith("/nutrition") ? "text-fitfest-bright underline" : "text-fitfest-text hover:text-fitfest-bright"
            }`}>
              Nutrition
            </span>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/profile">
          <Button className="bg-fitfest-bright text-white hover:bg-fitfest-deep px-3 py-2 rounded transition-colors">
            {profileData?.name || session?.user?.email || 'Profile'}
          </Button>
        </Link>
        {session?.user ? (
          <a href="/api/auth/signout">
            <Button className="!bg-fitfest-coral text-white hover:!bg-red-700 transition-colors">
              Sign out
            </Button>
          </a>
        ) : (
          <a href="/api/auth/signin">
            <Button className="bg-fitfest-deep text-white hover:bg-fitfest-bright transition-colors">
              Sign in
            </Button>
          </a>
        )}
      </div>
    </nav>
  );
} 