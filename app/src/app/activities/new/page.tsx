"use client";
import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";

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

export default function NewActivityPage() {
  const [type, setType] = useState("");
  const [effort, setEffort] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          effort: effort || null,
          date,
          duration,
          distance: distance || null,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to log activity.");
      } else {
        router.push("/activities");
      }
    } catch (err) {
      setError("Failed to log activity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 bg-gray-50 dark:bg-fitfest-dark transition-colors duration-200">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-fitfest-subtle">Log Activity</h1>
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
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Saving..." : "Save Activity"}
          </Button>
        </form>
      </Card>
    </div>
  );
} 