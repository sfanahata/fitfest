"use client";
import { useSession } from "next-auth/react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Profile {
  weight: number | null;
  height: number | null;
  name: string | null;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    weight: null,
    height: null,
    name: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch("/api/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setProfile(data.profile || { weight: null, height: null, name: null });
        setError('');
      })
      .catch(() => {
        setError("Could not load profile data.");
      })
      .finally(() => setLoading(false));
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Profile updated!");
      router.refresh();
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

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
        {loading ? (
          <div className="mb-4 text-center">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <div className="bg-gray-100 rounded px-3 py-2">{session.user?.email}</div>
            </div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name || ""}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div className="mb-4 flex gap-2">
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-1" htmlFor="weight">Weight (kg)</label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Your weight"
                  value={profile.weight || ""}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-1" htmlFor="height">Height (cm)</label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  step="0.1"
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Your height"
                  value={profile.height || ""}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>
            </div>
            {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
            {success && <div className="mb-2 text-green-600 text-sm">{success}</div>}
            <Button className="w-full mt-4" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </form>
        )}
      </Card>
    </div>
  );
} 