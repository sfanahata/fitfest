"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/Card";
import Button from "@/components/Button";

const activityTypes = [
  "walking",
  "running",
  "cycling",
  "swimming",
  "weightlifting",
  "aerobics",
  "yoga",
  "hiking",
  "dancing",
  "other",
];

const effortLevels = ["easy", "moderate", "hard"];

interface Activity {
  id: string;
  type: string;
  effort?: string | null;
  date: string;
  duration: number;
  distance?: number | null;
  notes?: string | null;
  calories?: number | null;
}

export default function EditActivityPage() {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [type, setType] = useState("");
  const [effort, setEffort] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      try {
        const res = await fetch(`/api/activities/${id}`);
        if (res.ok) {
          const data = await res.json();
          const activityData = data.activity;
          setActivity(activityData);
          
          // Pre-populate form fields
          setType(activityData.type);
          setEffort(activityData.effort || "");
          setDate(new Date(activityData.date).toISOString().split('T')[0]);
          setDuration(activityData.duration.toString());
          setDistance(activityData.distance?.toString() || "");
          setNotes(activityData.notes || "");
        } else if (res.status === 404) {
          setError("Activity not found.");
        } else if (res.status === 401) {
          setError("You are not authorized to edit this activity.");
        } else {
          setError("Failed to load activity. Please try again.");
        }
      } catch (err) {
        setError("Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchActivity();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    // Client-side validation
    if (parseInt(duration) <= 0) {
      setError("Duration must be greater than 0");
      setSaving(false);
      return;
    }
    
    if (distance && parseFloat(distance) < 0) {
      setError("Distance cannot be negative");
      setSaving(false);
      return;
    }
    
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          effort: effort || null,
          date,
          duration: parseInt(duration),
          distance: distance ? parseFloat(distance) : null,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update activity.");
      } else {
        router.push(`/activities/${id}`);
      }
    } catch (err) {
      setError("Failed to update activity.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-2">
        <Card className="w-full max-w-md text-center">Loading...</Card>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-2">
        <Card className="w-full max-w-md text-center">Activity not found.</Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 bg-gray-50 dark:bg-fitfest-dark transition-colors duration-200">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-fitfest-subtle">Edit Activity</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-fitfest-subtle">Type</label>
            <select
              className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              value={type}
              onChange={e => setType(e.target.value)}
              required
            >
              <option value="">Select activity type</option>
              {activityTypes.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-fitfest-subtle">Effort</label>
            <select
              className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              value={effort}
              onChange={e => setEffort(e.target.value)}
            >
              <option value="">Select effort (optional)</option>
              {effortLevels.map((e) => (
                <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-fitfest-subtle">Date</label>
            <input
              type="date"
              className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-fitfest-subtle">Duration (minutes)</label>
            <input
              type="number"
              className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              min={1}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-fitfest-subtle">Distance (km, optional)</label>
            <input
              type="number"
              className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-fitfest-subtle">Notes (optional)</label>
            <textarea
              className="border border-gray-300 dark:border-fitfest-subtle/20 rounded px-3 py-2 w-full bg-white dark:bg-fitfest-dark-tertiary text-gray-900 dark:text-fitfest-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
          <div className="flex gap-2">
            <Button 
              type="button" 
              className="flex-1" 
              onClick={() => router.push(`/activities/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 