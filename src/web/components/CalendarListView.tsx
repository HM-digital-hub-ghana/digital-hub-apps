import { useMemo } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@web/components/ui/table";
import type { Booking, Room, Employee } from "@web/conference-and-visitors-booking/service/bookings";
import { cn } from "@/lib/utils";

interface CalendarListViewProps {
  bookings: Booking[];
  rooms: Room[];
  employees: Employee[];
  onBookingClick?: (booking: Booking) => void;
  isLoading?: boolean;
  error?: string | null;
}

//colour dots for different bookings
const getBookingColor = (index: number): string => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-pink-500",
    "bg-orange-500",
  ];
  return colors[index % colors.length];
};

//get status badge styling
const getStatusBadge = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower === "ongoing" || statusLower === "confirmed") {
    return "bg-blue-100 text-blue-700";
  }
  if (statusLower === "completed") {
    return "bg-green-100 text-green-700";
  }
  if (statusLower === "scheduled") {
    return "bg-yellow-100 text-yellow-700";
  }
  if (statusLower === "cancelled") {
    return "bg-red-100 text-red-700";
  }
  return "bg-gray-100 text-gray-700";
};

export default function CalendarListView({
  bookings,
  rooms,
  employees,
  onBookingClick,
  isLoading = false,
  error = null,
}: CalendarListViewProps) {
  //create lookup map
  const roomMap = useMemo(() => {
    const map = new Map<number, string>();
    rooms.forEach((room) => map.set(room.id, room.name));
    return map;
  }, [rooms]);

  const employeeMap = useMemo(() => {
    const map = new Map<number, string>();
    employees.forEach((emp) => map.set(emp.id, emp.employee_name));
    return map;
  }, [employees]);

  //format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayName = days[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    return `${dayName}, ${month} ${day}`;
  };

  //format time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Booking List</h1>
        <p className="text-[#717182]">All scheduled meetings</p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border rounded-lg bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[#717182]">Loading bookings…</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="relative w-full">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold bg-gray-50">MEETING TITLE</TableHead>
                  <TableHead className="font-semibold bg-gray-50">ROOM</TableHead>
                  <TableHead className="font-semibold bg-gray-50">DATE</TableHead>
                  <TableHead className="font-semibold bg-gray-50">TIME</TableHead>
                  <TableHead className="font-semibold bg-gray-50">HOST</TableHead>
                  <TableHead className="font-semibold bg-gray-50">STATUS</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#717182]">
                    No bookings available
                  </TableCell>
                </TableRow>
              ) : (
              bookings.map((booking, index) => {
                const roomName = booking.room_name || roomMap.get(booking.room_id) || `Room ${booking.room_id}`;
                const hostName = employeeMap.get(booking.user_id) || `User ${booking.user_id}`;
                const startTime = formatTime(booking.start_time);
                const endTime = formatTime(booking.end_time);
                const date = formatDate(booking.start_time);
                const status = booking.status || "Scheduled";

                //determine the status of the booking
                const now = new Date();
                const start = new Date(booking.start_time);
                const end = new Date(booking.end_time);
                
                let displayStatus = status;
                //if status is already "Completed" from the backend, use it
                if (status === "Completed") {
                  displayStatus = "Completed";
                }
                //check if booking is ongoing(current time is between start and end)
                else if (now >= start && now <= end && status === "Confirmed") {
                  displayStatus = "Ongoing";
                }
                //check if booking is completed: use this when it is not automatically "Completed" on the backend(Confirmed and end time is past)
                else if (status === "Confirmed" && now > end) {
                  displayStatus = "Completed";
                }

                return (
                  <TableRow
                    key={booking.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onBookingClick?.(booking)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getBookingColor(index))} />
                        <span className="font-medium">{booking.purpose || "Untitled Meeting"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#717182]">{roomName}</TableCell>
                    <TableCell className="text-[#717182]">{date}</TableCell>
                    <TableCell className="text-[#717182]">
                      {startTime} - {endTime}
                    </TableCell>
                    <TableCell className="text-[#717182]">{hostName}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          getStatusBadge(displayStatus)
                        )}
                      >
                        {displayStatus}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
              )}
            </TableBody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

