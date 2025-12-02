import { apiGetAllBookings, type Booking } from "./bookings";
import { apiGetAllVisitors, type VisitorWithVisits } from "./visitors";

export interface ActivityItem {
  id: string;
  type: "booking" | "visitor_checkin" | "visitor_checkout" | "visitor_scheduled";
  title: string;
  description: string;
  timestamp: Date;
  icon: "booking" | "checkin" | "checkout" | "scheduled";
}

interface ActivityCache {
  data: ActivityItem[];
  timestamp: number;
  expiresIn: number;
}

const CACHE_DURATION = 60000;
let activityCache: ActivityCache | null = null;

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

const formatDate = (date: Date): string => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

export const getActivityFeed = async (userId?: number): Promise<ActivityItem[]> => {
  const now = Date.now();

  if (activityCache && now - activityCache.timestamp < activityCache.expiresIn) {
    if (userId) {
      return activityCache.data.filter((activity) => {
        const activityUserId = (activity as ActivityItem & { userId?: number }).userId;
        return activityUserId === userId;
      });
    }
    return activityCache.data;
  }

  try {
    const [bookings, visitors] = await Promise.all([
      apiGetAllBookings(),
      apiGetAllVisitors(),
    ]);

    const activities: ActivityItem[] = [];

    bookings.forEach((booking: Booking) => {
      const createdDate = new Date(booking.created_at);
      activities.push({
        id: `booking-${booking.id}`,
        type: "booking",
        title: `Room ${booking.room_name || booking.room_id} booked`,
        description: `${booking.purpose} by ${booking.user_id}`,
        timestamp: createdDate,
        icon: "booking",
        userId: booking.user_id,
      } as ActivityItem & { userId?: number });
    });

    visitors.forEach((visitor: VisitorWithVisits) => {
      visitor.visits.forEach((visit) => {
        if (visit.check_in_time) {
          const checkInDate = new Date(visit.check_in_time);
          activities.push({
            id: `checkin-${visit.id}`,
            type: "visitor_checkin",
            title: `Visitor ${visitor.name} checked in`,
            description: `Host: ${visit.host_name}`,
            timestamp: checkInDate,
            icon: "checkin",
            userId: visit.host_id,
          } as ActivityItem & { userId?: number });
        }

        if (visit.check_out_time) {
          const checkOutDate = new Date(visit.check_out_time);
          activities.push({
            id: `checkout-${visit.id}`,
            type: "visitor_checkout",
            title: `Visitor ${visitor.name} checked out`,
            description: `Host: ${visit.host_name}`,
            timestamp: checkOutDate,
            icon: "checkout",
            userId: visit.host_id,
          } as ActivityItem & { userId?: number });
        }

        if (visit.status === "Approved" || visit.status === "Confirmed") {
          const scheduledDate = new Date(visit.scheduled_date);
          activities.push({
            id: `scheduled-${visit.id}`,
            type: "visitor_scheduled",
            title: `Visitor ${visitor.name} scheduled`,
            description: `Host: ${visit.host_name}`,
            timestamp: scheduledDate,
            icon: "scheduled",
            userId: visit.host_id,
          } as ActivityItem & { userId?: number });
        }
      });
    });

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    activityCache = {
      data: activities,
      timestamp: now,
      expiresIn: CACHE_DURATION,
    };

    if (userId) {
      return activities.filter((activity) => {
        const activityUserId = (activity as ActivityItem & { userId?: number }).userId;
        return activityUserId === userId;
      });
    }

    return activities;
  } catch (error) {
    console.error("Failed to fetch activity feed:", error);
    return activityCache?.data || [];
  }
};

export const clearActivityCache = () => {
  activityCache = null;
};

export { formatTimeAgo, formatDate };

