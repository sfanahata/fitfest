"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/Card";
import Button from "@/components/Button";

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

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      const res = await fetch(`/api/activities/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActivity(data.activity || null);
      }
      setLoading(false);
    }
    if (id) fetchActivity();
  }, [id]);

const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/activities");
      } else if (res.status === 401) {
        alert("You are not authorized to delete this activity.");
      } else {
        alert("Failed to delete activity. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please check your connection and try again.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
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
    <div className="flex flex-col items-center justify-center min-h-screen px-2">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Activity Details</h1>
        <div className="mb-2"><span className="font-semibold">Type:</span> <span className="capitalize">{activity.type}</span></div>
        {activity.effort && <div className="mb-2"><span className="font-semibold">Effort:</span> <span className="capitalize">{activity.effort}</span></div>}
        <div className="mb-2"><span className="font-semibold">Date:</span> {new Date(activity.date).toLocaleDateString()}</div>
        <div className="mb-2"><span className="font-semibold">Duration:</span> {activity.duration} min</div>
        {activity.distance !== null && activity.distance !== undefined && (
          <div className="mb-2"><span className="font-semibold">Distance:</span> {activity.distance} km</div>
        )}
        <div className="mb-2"><span className="font-semibold">Calories:</span> {activity.calories} kcal</div>
        {activity.notes && <div className="mb-2"><span className="font-semibold">Notes:</span> {activity.notes}</div>}
        
        {showDeleteConfirm ? (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 mb-3">Are you sure you want to delete this activity?</p>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-gray-500 text-white hover:bg-gray-600" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-600 text-white hover:bg-red-700" 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mt-4">
            <Button className="flex-1" onClick={() => router.push("/activities")}>Back to Activities</Button>
            <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700" onClick={() => router.push(`/activities/${id}/edit`)}>Edit Activity</Button>
            <Button className="flex-1 bg-red-600 text-white hover:bg-red-700" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
          </div>
        )}
      </Card>
    </div>
  );
} 