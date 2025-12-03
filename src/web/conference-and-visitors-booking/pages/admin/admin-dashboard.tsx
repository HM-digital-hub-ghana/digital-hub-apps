import { useEffect, useState } from "react";
import { ActiveBookings } from "@web/components/AdminComponents/activeBooking";
import { ActivityFeed } from "@web/components/AdminComponents/activityFeed";
import { EmployeesChart } from "@web/components/AdminComponents/employeeChart";
import { QuickActions } from "@web/components/AdminComponents/quickAction";
import { VisitorOverview } from "@web/components/AdminComponents/visitorOverView";
import { StatsCard } from "@web/components/status-card";
import {
  Users,
  DoorClosed,
  Calendar,
  Clock,
} from "lucide-react";
import { apiGetPendingVisits } from "@web/conference-and-visitors-booking/service/visitors";
import { apiGetAllBookings, apiGetRooms } from "@web/conference-and-visitors-booking/service/bookings";
import { apiGetAllVisitors } from "@web/conference-and-visitors-booking/service/visitors";
import {
  getActiveMeetings,
  getRoomsAvailable,
  getTotalVisitorsExpectedToday,
} from "@/lib/dashboard-utils";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [pendingCount, setPendingCount] = useState(0);
  const [activeMeetings, setActiveMeetings] = useState(0);
  const [totalVisitorsExpected, setTotalVisitorsExpected] = useState(0);
  const [roomsAvailable, setRoomsAvailable] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [pendingVisits, bookings, rooms, visitors] = await Promise.all([
          apiGetPendingVisits(),
          apiGetAllBookings(),
          apiGetRooms(),
          apiGetAllVisitors(),
        ]);

        setPendingCount(pendingVisits.length);
        setActiveMeetings(getActiveMeetings(bookings));
        setTotalVisitorsExpected(getTotalVisitorsExpectedToday(visitors));
        setRoomsAvailable(getRoomsAvailable(rooms, bookings));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-4">
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatsCard
          icon={Clock}
          iconBg="#00DD3915"
          iconColor="#00DD39"
          title="Pending Visitors Requests"
          value={
            isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              pendingCount
            )
          }
        />
        <StatsCard
          icon={Calendar}
          iconBg="#024D2C15"
          iconColor="primary"
          title="Active Meetings"
          value={
            isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              activeMeetings
            )
          }
        />
        <StatsCard
          icon={Users}
          iconBg="#00DD3915"
          iconColor="#00DD39"
          title="Total Visitors Expected"
          value={
            isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              totalVisitorsExpected
            )
          }
        />
        <StatsCard
          icon={DoorClosed}
          iconBg="#024D2C15"
          iconColor="primary"
          title="Rooms Available"
          value={
            isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              roomsAvailable
            )
          }
        />
      </div>
      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-2/3 space-y-6">
          <QuickActions />
          <EmployeesChart />
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:flex-1">
          <ActivityFeed />
        </div>
      </div>
      <div className="md:flex space-y-3  md:space-y-0 mt-3 gap-6">
        <div className="flex-1">
          <ActiveBookings />
        </div>
        <div className="flex-1">
          <VisitorOverview />
        </div>
      </div>
    </div>
  );
}
