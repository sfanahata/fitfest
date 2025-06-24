"use client";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      const res = await fetch("/api/activities");
      if (res.ok) {
        const data = await res.json();
        setActivities(data || []);
      }
      setLoading(false);
    }
    fetchActivities();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) {
      return;
    }
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Remove the activity from the list
        setActivities(activities.filter(activity => activity.id !== id));
      } else {
        alert("Failed to delete activity.");
      }
    } catch (err) {
      alert("Failed to delete activity.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Your Activities</h1>
          <Link href="/activities/new" passHref legacyBehavior>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Log Activity
            </Button>
          </Link>
        </div>
        {loading ? (
          <Card className="text-center">Loading...</Card>
        ) : activities.length === 0 ? (
          <Card className="text-center">No activities logged yet. Click &quot;Log Activity&quot; to add your first!</Card>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id} className="flex flex-col md:flex-row md:items-center justify-between">
              <Link href={`/activities/${activity.id}`} className="flex-1 cursor-pointer hover:bg-blue-50 transition-colors p-2 rounded">
                <div>
                  <div className="font-semibold capitalize">{activity.type}</div>
                  <div className="text-gray-600 text-sm">{new Date(activity.date).toLocaleDateString()}</div>
                  {activity.notes && <div className="text-gray-500 text-xs mt-1">{activity.notes}</div>}
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <span className="text-gray-700 block">{activity.duration} min</span>
                  {activity.calories !== undefined && (
                    <span className="text-green-700 font-semibold block">{activity.calories} kcal</span>
                  )}
                </div>
              </Link>
              <div className="flex gap-2 mt-2 md:mt-0 md:ml-4">
                <Button 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 text-sm"
                  onClick={() => router.push(`/activities/${activity.id}/edit`)}
                >
                  Edit
                </Button>
                <Button 
                  className="bg-red-600 text-white hover:bg-red-700 px-3 py-1 text-sm"
                  onClick={() => handleDelete(activity.id)}
                  disabled={deletingId === activity.id}
                >
                  {deletingId === activity.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 