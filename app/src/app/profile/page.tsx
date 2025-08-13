"use client";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Profile {
  weight: number | null;
  height: number | null;
  name: string | null;
}

interface Session {
  user?: {
    email?: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    weight: null,
    height: null,
    name: null,
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      }
    }
    
    getSession();
  }, []);

  useEffect(() => {
    if (!session?.user?.email) return; // Don't fetch if no session
    
    setLoading(true);
    fetch("/api/profile", {
      credentials: 'include'
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        console.log('Profile data loaded:', data);
        setProfile({
          weight: data.profile?.weight || null,
          height: data.profile?.height || null,
          name: data.name || data.profile?.name || null
        });
        setError('');
      })
      .catch((error) => {
        console.error('Profile load error:', error);
        setError("Could not load profile data.");
      })
      .finally(() => setLoading(false));
  }, [session?.user?.email]); // Re-run when session changes

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
        credentials: 'include',
        body: JSON.stringify(profile),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Profile save error:', errorText);
        throw new Error(errorText);
      }
      
      const result = await res.json();
      console.log('Profile save success:', result);
      setSuccess("Profile updated!");
      
      // Reload profile data
      const profileRes = await fetch("/api/profile", {
        credentials: 'include'
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        console.log('Reloaded profile data:', data);
        setProfile({
          weight: data.profile?.weight || null,
          height: data.profile?.height || null,
          name: data.name || data.profile?.name || null
        });
      }
    } catch (error) {
      console.error('Profile save failed:', error);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // Simple authentication check - redirect to sign in if not authenticated
  useEffect(() => {
    // For now, always show the profile page
    // We'll handle authentication differently
  }, []);

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
              <div className="bg-gray-100 rounded px-3 py-2">
                {session?.user?.email || 'Loading...'}
              </div>
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