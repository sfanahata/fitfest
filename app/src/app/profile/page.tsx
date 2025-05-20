"use client";
import { useSession } from "next-auth/react";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">You must be signed in to view your profile.</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Email</label>
          <div className="bg-gray-100 rounded px-3 py-2">{session.user?.email}</div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Name</label>
          <input type="text" className="border rounded px-3 py-2 w-full" placeholder="Your name (coming soon)" disabled />
        </div>
        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-1">Weight (kg)</label>
            <input type="number" className="border rounded px-3 py-2 w-full" placeholder="(coming soon)" disabled />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-1">Height (cm)</label>
            <input type="number" className="border rounded px-3 py-2 w-full" placeholder="(coming soon)" disabled />
          </div>
        </div>
        <Button className="w-full mt-4" disabled>Save Changes (coming soon)</Button>
      </Card>
    </div>
  );
} 