import { useState, useEffect } from "react";
import { StatsCard } from "@/components/status-card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  DoorClosed,
  Calendar,
  Clock,
  Dot,
  UserPlus,
  ArrowRight,
  Map,
  User,
  Plus,
  Loader2,
  CalendarClock,
  CalendarCheck,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BookingForm } from "@/components/BookingForm";
import VisitorRequestForm from "@/components/VisitorRequestForm";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AdminDashboard from "../admin/admin-dashboard";
import { EmptyState } from "@/components/empty-state";
import { apiGetUserProfile } from "@/service/user";
import { apiGetAllBookings, apiGetRooms } from "@/service/bookings";
import { apiGetAllVisitors } from "@/service/visitors";
import {
  getHoursScheduledToday,
  getMeetingsToday,
  getVisitorsExpectedToday,
  getRoomsAvailable,
  getUpcomingMeetingsToday,
  getUpcomingVisitorsToday,
} from "@/lib/dashboard-utils";

import { getActivityFeed, formatTimeAgo, formatDate, type ActivityItem } from "@/service/activity";
import { Button } from '@/components/ui/button';

// --- upcomings component ---
interface MeetingItemProps {
  time: string;
  title: string;
  location?: string;
  attendees?: string;
}

function UpcomingEvent({ time, title, location, attendees }: MeetingItemProps) {
  return (
    <div className="flex flex-col transition border rounded-lg p-3 cursor-pointer">
      <div className="flex  flex-col mb-2">
        <div className="flex ">
          <div className="flex items-center gap-2 text-xs text-muted-foreground ">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
        </div>
        <div>
          <h3 className="text-base  font-semibold">{title}</h3>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {location && (
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            <span>{location}</span>
          </div>
        )}

        {attendees && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{attendees}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Dashboard Component ---
export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);
  const [hoursScheduled, setHoursScheduled] = useState(0);
  const [meetingsToday, setMeetingsToday] = useState(0);
  const [visitorsExpected, setVisitorsExpected] = useState(0);
  const [roomsAvailable, setRoomsAvailable] = useState(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [meetings, setMeetings] = useState<Array<{ time: string; title: string; location: string; attendees: string }>>([]);
  const [visitors, setVisitors] = useState<Array<{ time: string; title: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await apiGetUserProfile();
        setUserId(profile.id);
        setUserName(profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}`.trim() : user?.name || "User");
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setUserName(user?.name || "User");
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const [bookings, rooms, visitorsData, activityData] = await Promise.all([
          apiGetAllBookings(),
          apiGetRooms(),
          apiGetAllVisitors(),
          getActivityFeed(userId),
        ]);

        setHoursScheduled(getHoursScheduledToday(bookings, userId));
        setMeetingsToday(getMeetingsToday(bookings, userId));
        setVisitorsExpected(getVisitorsExpectedToday(visitorsData, userId));
        setRoomsAvailable(getRoomsAvailable(rooms, bookings));
        setActivities(activityData);
        setMeetings(getUpcomingMeetingsToday(bookings, userId));
        setVisitors(getUpcomingVisitorsToday(visitorsData, userId));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  if (isAdmin) {
    return <AdminDashboard />;
  }

  const getActivityIcon = (icon: string) => {
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

  const getActivityIconStyles = (icon: string) => {
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

  const getActivityStatus = (type: string) => {
    switch (type) {
      case "visitor_checkin":
      case "visitor_scheduled":
        return "Approved";
      case "visitor_checkout":
        return "Completed";
      case "booking":
        return "Approved";
      default:
        return "Pending";
    }
  };

  const statusColors: Record<string, string> = {
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Declined: "bg-red-100 text-red-700",
    Completed: "bg-blue-100 text-blue-700",
  };

  // --- Activity "View More" Logic ---
  const [showAll, setShowAll] = useState(false);
  const VISIBLE_LIMIT = 3;
  const visibleActivities = showAll
    ? activities
    : activities.slice(0, VISIBLE_LIMIT);
  const hasMore = activities.length > VISIBLE_LIMIT;

  // --- Meetings "View Full Schedule" Logic ---
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const VISIBLE_MEETINGS = 2;
  const visibleMeetings = showFullSchedule
    ? meetings
    : meetings.slice(0, VISIBLE_MEETINGS);

  // --- Visitors "View More" Logic ---
  const [showAllVisitors, setShowAllVisitors] = useState(false);
  const VISIBLE_VISITORS = 2;
  const visibleVisitors = showAllVisitors
    ? visitors
    : visitors.slice(0, VISIBLE_VISITORS);

  // --- Dialog States ---
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isVisitorRequestDialogOpen, setIsVisitorRequestDialogOpen] =
    useState(false);

  return (
    <div className="py-4 overflow-x-hidden">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold">Hi, {userName}</h1>
        <p className="text-muted-foreground">Welcome back to your dashboard</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
        <StatsCard
          icon={Clock}
          iconBg="#00DD3915"
          iconColor="#00DD39"
          title="Hours Scheduled"
          value={
            isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              hoursScheduled
            )
          }
        />
        <StatsCard
          icon={Calendar}
          iconBg="#024D2C15"
          iconColor="primary"
          title="Meetings Today"
          value={
            isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              meetingsToday
            )
          }
        />
        <StatsCard
          icon={Users}
          iconBg="#00DD3915"
          iconColor="#00DD39"
          title="Visitors Expected"
          value={
            isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              visitorsExpected
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

      {/* Main Section */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-2/3 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[#0A0A0A] font-semibold">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm font-normal text-[#717182] ">
                Fast access to common tasks
              </CardDescription>
              <Separator className="my-4 w-full" />
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                {/* New Booking */}
                <Dialog
                  open={isBookingDialogOpen}
                  onOpenChange={setIsBookingDialogOpen}
                >
                  <div
                    className="flex hover:bg-primary/3 rounded-lg p-3 items-center gap-4 cursor-pointer transition-colors"
                    onClick={() => setIsBookingDialogOpen(true)}
                  >
                    <div className="p-2 pl-3 pt-3 bg-primary/10 text-primary rounded-[10px] w-12 h-12">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold">New Booking</h3>
                      <p className="text-[#717182] font-normal text-xs">
                        Book a meeting room
                      </p>
                    </div>
                    <div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <DialogContent
                    className="max-w-[500px] p-0"
                    showCloseButton={false}
                  >
                    <DialogTitle className="sr-only">
                      Make a Booking
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Fill out the form to book a meeting room
                    </DialogDescription>
                    <BookingForm
                      onCancel={() => setIsBookingDialogOpen(false)}
                      onSubmit={() => {
                        setIsBookingDialogOpen(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>

                {/* Visitor Request */}
                <Dialog
                  open={isVisitorRequestDialogOpen}
                  onOpenChange={setIsVisitorRequestDialogOpen}
                >
                  <div
                    className="flex hover:bg-primary/3 rounded-lg p-3 items-center gap-4 cursor-pointer transition-colors"
                    onClick={() => setIsVisitorRequestDialogOpen(true)}
                  >
                    <div className="p-2 pl-3 pt-3 bg-[#00DD3915] text-[#00DD39] rounded-[10px] w-12 h-12">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold">
                        Visitor Request
                      </h3>
                      <p className="text-[#717182] font-normal text-xs">
                        Submit new request
                      </p>
                    </div>
                    <div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <DialogContent className="max-w-[700px] p-0 max-h-[90vh] flex flex-col overflow-hidden">
                    <DialogTitle className="sr-only">
                      Visitor Request
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Submit a new visitor request
                    </DialogDescription>
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden h-full">
                      <VisitorRequestForm
                        onSubmit={() => setIsVisitorRequestDialogOpen(false)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[#0A0A0A] font-semibold">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-sm font-normal text-[#717182]">
                Your workspace activity over the last 7 days
              </CardDescription>
              <Separator className="my-4 w-full" />
            </CardHeader>

            <CardContent className="space-y-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : visibleActivities.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  No recent activity
                </p>
              ) : (
                visibleActivities.map((a) => {
                  const Icon = getActivityIcon(a.icon);
                  const status = getActivityStatus(a.type);
                  const iconStyles = getActivityIconStyles(a.icon);
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between transition rounded-lg p-3"
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-full", iconStyles.bg)}>
                          <Icon className={cn("w-5 h-5", iconStyles.color)} />
                        </div>

                        <div>
                          <h3 className="text-base font-semibold">{a.title}</h3>
                          <p className="text-muted-foreground text-xs">
                            {a.description}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{formatTimeAgo(a.timestamp)}</span>
                            <Dot className="mx-1" />
                            <span>{formatDate(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "px-4 py-1.5 rounded-full text-sm font-medium capitalize shrink-0",
                          statusColors[status] || "bg-gray-100 text-gray-700"
                        )}
                      >
                        {status}
                      </div>
                    </div>
                  );
                })
              )}

              <Separator className="w-full" />

              {hasMore && (
                <div className="flex">
                  <Button
                    type="button"
                    onClick={() => setShowAll((s) => !s)}
                    className="text-sm font-medium text-primary bg-white hover:underline px-2 py-1 rounded"
                    aria-expanded={showAll}
                  >
                    {showAll
                      ? "View less"
                      : `View more (${activities.length - VISIBLE_LIMIT})`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full space-y-3 lg:flex-1">
          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[#0A0A0A] font-semibold">
                Upcoming Meetings
              </CardTitle>
              <CardDescription className="text-sm font-normal text-[#717182]">
                Your scheduled meetings for today
              </CardDescription>
              <Separator className="my-4 w-full" />
            </CardHeader>

            <CardContent className="space-y-3">
              {meetings.length === 0 ? (
                <EmptyState
                  title="No Upcoming Meetings"
                  description="You don't have any meetings scheduled."
                  action={{
                    label: "Book a Room",
                    onClick: () => setIsBookingDialogOpen(true),
                  }}
                />
              ) : (
                <>
                  {visibleMeetings.map((meeting, i) => (
                    <UpcomingEvent key={i} {...meeting} />
                  ))}

                  {meetings.length > VISIBLE_MEETINGS && (
                    <div className="flex">
                      <Button
                        type="button"
                        onClick={() => setShowFullSchedule((prev) => !prev)}
                        className="text-sm font-medium bg-white text-primary hover:underline mt-2"
                        aria-expanded={showFullSchedule}
                      >
                        {showFullSchedule ? "View less" : "View full schedule"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Visitors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[#0A0A0A] font-semibold">
                Upcoming Visitors
              </CardTitle>
              <CardDescription className="text-sm font-normal text-[#717182]">
                Your scheduled visitors for today
              </CardDescription>
              <Separator className="my-4 w-full" />
            </CardHeader>

            <CardContent className="space-y-3">
              {visitors.length === 0 ? (
                <EmptyState
                  title="No Upcoming Visitors"
                  description="You don't have any visitors scheduled."
                  action={{
                    label: "Add Visitor",
                    onClick: () => setIsVisitorRequestDialogOpen(true),
                  }}
                />
              ) : (
                <>
                  {visibleVisitors.map((visitor, i) => (
                    <UpcomingEvent key={i} {...visitor} />
                  ))}

                  {visitors.length > VISIBLE_VISITORS && (
                    <div className="flex">
                      <Button
                        type="button"
                        onClick={() => setShowAllVisitors((prev) => !prev)}
                        className="text-sm font-medium  bg-white text-primary hover:underline mt-2"
                        aria-expanded={showAllVisitors}
                      >
                        {showAllVisitors ? "View less" : "View all visitors"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
