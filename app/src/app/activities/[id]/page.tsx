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
        <Button className="w-full mt-4" onClick={() => router.push("/activities")}>Back to Activities</Button>
      </Card>
    </div>
  );
} 