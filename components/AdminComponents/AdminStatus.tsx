import  { useEffect, useState } from "react";
import { StatsCard } from "@/components/status-card";
import { Calendar, CircleX, RefreshCcw, CircleCheckBig } from "lucide-react";
import {
  apiGetAllBookings,
  type Booking,
} from "../../src/web/conference-and-visitors-booking/service/bookings";

interface AdminStatusProps {
  isAdmin: boolean;
  refreshKey?: number;
}

export default function AdminStatus({ isAdmin, refreshKey = 0 }: AdminStatusProps) {
  const [bookingsToday, setBookingsToday] = useState<number>(0);
  const [cancelledCount, setCancelledCount] = useState<number>(0);
  const [activeMeetings, setActiveMeetings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;

      try {
        setIsLoading(true);
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        const startISO = todayStart.toISOString();
        const endISO = todayEnd.toISOString();

        const [todayBookings, cancelledBookings, allBookings] = await Promise.all([
          apiGetAllBookings({ start: startISO, end: endISO }),
          apiGetAllBookings({ start: startISO, end: endISO, status: "Cancelled" }),
          apiGetAllBookings(),
        ]);

        setBookingsToday(todayBookings.length);
        setCancelledCount(cancelledBookings.length);

        const active = allBookings.filter((booking: Booking) => {
          const start = new Date(booking.start_time);
          const end = new Date(booking.end_time);
          return now >= start && now <= end && booking.status !== "Cancelled";
        });

        setActiveMeetings(active.length);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, refreshKey]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatsCard
          icon={Calendar}
          iconBg="bg-[#EFF6FF]"
          iconColor="text-[#1E88E5]"
          title="Total Bookings Today"
          subtitle=""
          value={isLoading ? "..." : bookingsToday}
        />

        <StatsCard
          icon={CircleX}
          iconBg="bg-[#FF00001A]"
          iconColor="text-[#E7000B]"
          title="Cancelled"
          subtitle=""
          value={isLoading ? "..." : cancelledCount}
        />

        <StatsCard
          icon={RefreshCcw}
          iconBg="bg-[#FAF5FF]"
          iconColor="text-[#AD46FF]"
          title="Rescheduled"
          subtitle=""
          value={0}
        />

        <StatsCard
          icon={CircleCheckBig}
          iconBg="bg-[#D1FAE5]"
          iconColor="text-[#10B981]"
          title="Active Meetings"
          subtitle=""
          value={isLoading ? "..." : activeMeetings}
        />
      </div>
    </div>
  );
}
