"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/Button";

export default function Header() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <header className="w-full flex justify-end items-center p-4 gap-2">
      <Link href="/profile">
        <Button className="bg-gray-500 text-white hover:bg-gray-600 mr-2">Profile</Button>
      </Link>
      <Button
        className="bg-red-500 text-white hover:bg-red-600"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </Button>
    </header>
  );
} 