import { useEffect, useState } from "react";
import { Card } from "@web/components/ui/card";
import { Clock, CalendarClock, CalendarCheck, LogIn, LogOut } from "lucide-react";
import {
  getActivityFeed,
  formatTimeAgo,
  type ActivityItem,
} from "../../conference-and-visitors-booking/service/activity";
import { Loader2 } from "lucide-react";

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const data = await getActivityFeed();
        setActivities(data.slice(0, 8));
      } catch (error) {
        console.error("Failed to fetch activity feed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 60000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (icon: string) => {
    switch (icon) {
      case "checkin":
        return LogIn;
      case "checkout":
        return LogOut;
      case "booking":
        return CalendarClock;
      case "scheduled":
        return CalendarCheck;
      default:
        return Clock;
    }
  };

  const getIconStyles = (icon: string) => {
    switch (icon) {
      case "checkin":
        return { bg: "bg-blue-100", color: "text-blue-600" };
      case "checkout":
        return { bg: "bg-cyan-100", color: "text-cyan-600" };
      case "booking":
        return { bg: "bg-emerald-100", color: "text-emerald-600" };
      case "scheduled":
        return { bg: "bg-purple-100", color: "text-purple-600" };
      default:
        return { bg: "bg-gray-100", color: "text-gray-600" };
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-gray-900">Activity Feed</h3>
          <p className="text-gray-600 text-sm">Latest system events</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-gray-900">Activity Feed</h3>
          <p className="text-gray-600 text-sm">Latest system events</p>
        </div>
        <p className="text-gray-500 text-sm text-center py-8">No activities available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-gray-900">Activity Feed</h3>
        <p className="text-gray-600 text-sm">Latest system events</p>
      </div>
      <div className="space-y-3 mb-4">
        {activities.map((activity) => {
          const Icon = getIcon(activity.icon);
          const styles = getIconStyles(activity.icon);
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`${styles.bg} p-2 rounded-lg flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${styles.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-sm">{activity.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{activity.description}</p>
                <p className="text-gray-500 text-xs mt-0.5">{formatTimeAgo(activity.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
