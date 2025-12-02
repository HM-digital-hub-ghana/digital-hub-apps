import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiGetAllBookings } from "../../src/web/conference-and-visitors-booking/service/bookings";
import { getActiveBookingsToday } from "@/lib/dashboard-utils";
import { Loader2 } from "lucide-react";

export function ActiveBookings() {
  const [bookings, setBookings] = useState<
    Array<{
      meeting: string;
      room: string;
      time: string;
      status: string;
      statusColor: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const allBookings = await apiGetAllBookings();
        const activeBookings = getActiveBookingsToday(allBookings);
        setBookings(activeBookings);
      } catch (error) {
        console.error("Failed to fetch active bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-gray-900">Active Bookings</h3>
          <p className="text-gray-600 text-sm">
            Ongoing and upcoming meetings today
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-gray-900">Active Bookings</h3>
          <p className="text-gray-600 text-sm">
            Ongoing and upcoming meetings today
          </p>
        </div>
        <p className="text-gray-500 text-sm text-center py-8">No active bookings</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-gray-900">Active Bookings</h3>
        <p className="text-gray-600 text-sm">
          Ongoing and upcoming meetings today
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MEETING</TableHead>
            <TableHead>ROOM</TableHead>
            <TableHead>TIME</TableHead>
            <TableHead>STATUS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking, index) => (
            <TableRow key={index}>
              <TableCell>{booking.meeting}</TableCell>
              <TableCell>{booking.room}</TableCell>
              <TableCell>{booking.time}</TableCell>
              <TableCell>
                <Badge
                  className={`${booking.statusColor} hover:${booking.statusColor} border-0`}
                >
                  {booking.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
