"use client";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

interface Profile {
  weight: number | null;
  height: number | null;
  name: string | null;
  targetCalories: number | null;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFat: number | null;
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
    targetCalories: null,
    targetProtein: null,
    targetCarbs: null,
    targetFat: null,
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'nutrition'>('profile');
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
        Sentry.captureException(error);
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
        setProfile({
          weight: data.profile?.weight ?? null,
          height: data.profile?.height ?? null,
          name: data.name ?? data.profile?.name ?? null,
          targetCalories: data.profile?.targetCalories ?? null,
          targetProtein: data.profile?.targetProtein ?? null,
          targetCarbs: data.profile?.targetCarbs ?? null,
          targetFat: data.profile?.targetFat ?? null,
        });
        setError('');
      })
      .catch((error) => {
        Sentry.captureException(error);
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
        throw new Error(errorText);
      }
      
      const result = await res.json();
      setSuccess("Profile updated!");
      
      // Reload profile data
      const profileRes = await fetch("/api/profile", {
        credentials: 'include'
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile({
          weight: data.profile?.weight ?? null,
          height: data.profile?.height ?? null,
          name: data.name ?? data.profile?.name ?? null,
          targetCalories: data.profile?.targetCalories ?? null,
          targetProtein: data.profile?.targetProtein ?? null,
          targetCarbs: data.profile?.targetCarbs ?? null,
          targetFat: data.profile?.targetFat ?? null,
        });
      }
    } catch (error) {
      Sentry.captureException(error);
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
      <Card className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
        {loading ? (
          <div className="mb-4 text-center">Loading...</div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab('nutrition')}
                className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                  activeTab === 'nutrition'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Nutritional Settings
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {activeTab === 'profile' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1">Email</label>
                    <div className="bg-gray-100 rounded px-3 py-2">
                      {session?.user?.email || 'Loading...'}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 dark:text-fitfest-subtle font-semibold mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profile.name || ""}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <div className="mb-4 flex gap-2">
                    <div className="flex-1">
                      <label className="block text-gray-700 dark:text-fitfest-subtle font-semibold mb-1" htmlFor="weight">Weight (kg)</label>
                      <input
                        id="weight"
                        name="weight"
                        type="number"
                        step="0.1"
                        className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Your weight"
                        value={profile.weight || ""}
                        onChange={handleChange}
                        disabled={saving}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-700 dark:text-fitfest-subtle font-semibold mb-1" htmlFor="height">Height (cm)</label>
                      <input
                        id="height"
                        name="height"
                        type="number"
                        step="0.1"
                        className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Your height"
                        value={profile.height || ""}
                        onChange={handleChange}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'nutrition' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="targetCalories" className="block text-gray-700 dark:text-fitfest-subtle font-semibold mb-1">
                      Daily Calorie Target
                    </label>
                    <input
                      type="number"
                      id="targetCalories"
                      name="targetCalories"
                      value={profile.targetCalories || ""}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="2000"
                      disabled={saving}
                    />
                  </div>
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="targetProtein" className="block text-gray-700 dark:text-fitfest-subtle font-semibold mb-1">
                        Protein Target (g)
                      </label>
                      <input
                        type="number"
                        id="targetProtein"
                        name="targetProtein"
                        value={profile.targetProtein || ""}
                        onChange={handleChange}
                        className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="98"
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <label htmlFor="targetCarbs" className="block text-gray-700 dark:text-fitfest-subtle font-semibold mb-1">
                        Carbs Target (g)
                      </label>
                      <input
                        type="number"
                        id="targetCarbs"
                        name="targetCarbs"
                        value={profile.targetCarbs || ""}
                        onChange={handleChange}
                        className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="244"
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <label htmlFor="targetFat" className="block text-gray-700 dark:text-fitfest-subtle font-semibold mb-1">
                        Fat Target (g)
                      </label>
                      <input
                        type="number"
                        id="targetFat"
                        name="targetFat"
                        value={profile.targetFat || ""}
                        onChange={handleChange}
                        className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="68"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </>
              )}

              {error && <div className="mb-2 text-red-600 dark:text-red-400 text-sm">{error}</div>}
              {success && <div className="mb-2 text-green-600 dark:text-green-400 text-sm">{success}</div>}
              <Button className="w-full mt-4" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
} 