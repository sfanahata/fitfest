"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Button from "@/components/Button";

export default function NavBar() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <nav className="w-full flex items-center justify-between p-4 bg-gray-100 shadow-sm sticky top-0 z-50">
      <div className="flex gap-4 items-center">
        <Link href="/">
          <span className="font-semibold text-lg text-blue-700 hover:underline">Home</span>
        </Link>
        <Link href="/activities">
          <span className="text-gray-700 hover:underline">Activities</span>
        </Link>
        {/* Profile link removed as requested. Uncomment if you want it back. */}
        {/* <Link href="/profile">
          <span className="text-gray-700 hover:underline">Profile</span>
        </Link> */}
      </div>
      <div className="flex items-center gap-4">
        <Link href="/profile">
          <Button className="bg-gray-400 text-gray-900 hover:bg-gray-500 px-3 py-2 rounded">
            {session.user?.email}
          </Button>
        </Link>
        <Button
          className="bg-red-500 text-white hover:bg-red-600"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
        </Button>
      </div>
    </nav>
  );
} 