import { type Booking } from "@/service/bookings";
import { type Room } from "@/service/bookings";
import { type VisitorWithVisits } from "@/service/visitors";

export const getActiveMeetings = (bookings: Booking[]): number => {
  const now = new Date();
  return bookings.filter((booking) => {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    const status = booking.status || "Scheduled";
    return now >= start && now <= end && status === "Confirmed";
  }).length;
};

export const getRoomsAvailable = (rooms: Room[], bookings: Booking[]): number => {
  const now = new Date();
  
  const bookedRoomIds = new Set(
    bookings
      .filter((booking) => {
        const start = new Date(booking.start_time);
        const end = new Date(booking.end_time);
        const status = booking.status || "Scheduled";
        return now >= start && now <= end && status === "Confirmed";
      })
      .map((booking) => booking.room_id)
  );

  return rooms.filter((room) => !bookedRoomIds.has(room.id)).length;
};

export const getTotalVisitorsExpectedToday = (visitors: VisitorWithVisits[]): number => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  let count = 0;
  visitors.forEach((visitor) => {
    visitor.visits.forEach((visit) => {
      const scheduledDate = new Date(visit.scheduled_date);
      const approvedStatuses = ["Approved", "Active", "Inactive", "Confirmed"];
      if (
        scheduledDate >= todayStart &&
        scheduledDate <= todayEnd &&
        approvedStatuses.includes(visit.status)
      ) {
        count++;
      }
    });
  });

  return count;
};

export const getHoursScheduledToday = (bookings: Booking[], userId: number): number => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  let totalHours = 0;
  bookings.forEach((booking) => {
    if (booking.user_id !== userId) return;

    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);

    if (start >= todayStart && start <= todayEnd) {
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalHours += hours;
    }
  });

  return Math.round(totalHours * 10) / 10;
};

export const getMeetingsToday = (bookings: Booking[], userId: number): number => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  return bookings.filter((booking) => {
    if (booking.user_id !== userId) return false;
    const start = new Date(booking.start_time);
    return start >= todayStart && start <= todayEnd;
  }).length;
};

export const getVisitorsExpectedToday = (
  visitors: VisitorWithVisits[],
  userId: number
): number => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  let count = 0;
  visitors.forEach((visitor) => {
    visitor.visits.forEach((visit) => {
      if (visit.host_id !== userId) return;
      const scheduledDate = new Date(visit.scheduled_date);
      const approvedStatuses = ["Approved", "Active", "Inactive", "Confirmed"];
      if (
        scheduledDate >= todayStart &&
        scheduledDate <= todayEnd &&
        approvedStatuses.includes(visit.status)
      ) {
        count++;
      }
    });
  });

  return count;
};

export const getUpcomingMeetingsToday = (bookings: Booking[], userId: number) => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  return bookings
    .filter((booking) => {
      if (booking.user_id !== userId) return false;
      const start = new Date(booking.start_time);
      return start >= todayStart && start <= todayEnd;
    })
    .sort((a, b) => {
      const startA = new Date(a.start_time).getTime();
      const startB = new Date(b.start_time).getTime();
      return startA - startB;
    })
    .map((booking) => {
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);
      const startTime = start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const endTime = end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        time: `${startTime} - ${endTime}`,
        title: booking.purpose,
        location: booking.room_name || `Room ${booking.room_id}`,
        attendees: booking.attendees
          ? `${booking.attendees.length} attendee${booking.attendees.length > 1 ? "s" : ""}`
          : "No attendees",
      };
    });
};

export const getUpcomingVisitorsToday = (visitors: VisitorWithVisits[], userId: number) => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const upcomingVisits: Array<{
    time: string;
    title: string;
  }> = [];

  visitors.forEach((visitor) => {
    visitor.visits.forEach((visit) => {
      if (visit.host_id !== userId) return;
      const scheduledDate = new Date(visit.scheduled_date);
      const approvedStatuses = ["Approved", "Active", "Inactive", "Confirmed"];
      if (
        scheduledDate >= todayStart &&
        scheduledDate <= todayEnd &&
        approvedStatuses.includes(visit.status)
      ) {
        const time = scheduledDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        upcomingVisits.push({
          time,
          title: visitor.name,
        });
      }
    });
  });

  return upcomingVisits.sort((a, b) => {
    const timeA = a.time;
    const timeB = b.time;
    return timeA.localeCompare(timeB);
  });
};

export const getEmployeeVisitorCounts = (
  visitors: VisitorWithVisits[]
): Array<{ name: string; value: number; percentage: number }> => {
  const employeeCounts = new Map<string, number>();

  visitors.forEach((visitor) => {
    visitor.visits.forEach((visit) => {
      const hostName = visit.host_name;
      const currentCount = employeeCounts.get(hostName) || 0;
      employeeCounts.set(hostName, currentCount + 1);
    });
  });

  const sorted = Array.from(employeeCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const maxValue = sorted[0]?.value || 1;

  return sorted.map((item) => ({
    ...item,
    percentage: Math.round((item.value / maxValue) * 100),
  }));
};

export const getActiveBookingsToday = (bookings: Booking[]) => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  return bookings
    .filter((booking) => {
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);
      const status = booking.status || "Scheduled";
      return (
        (start >= todayStart && start <= todayEnd) ||
        (now >= start && now <= end && status === "Confirmed")
      );
    })
    .map((booking) => {
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);
      const startTime = start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const endTime = end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const now = new Date();
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);
      const status = booking.status || "Scheduled";

      let displayStatus = status;
      if (status === "Completed") {
        displayStatus = "Completed";
      } else if (now >= bookingStart && now <= bookingEnd && status === "Confirmed") {
        displayStatus = "Ongoing";
      } else if (status === "Confirmed" && now > bookingEnd) {
        displayStatus = "Completed";
      }

      return {
        meeting: booking.purpose,
        room: booking.room_name || `Room ${booking.room_id}`,
        time: `${startTime}-${endTime}`,
        status: displayStatus,
        statusColor:
          displayStatus === "Ongoing"
            ? "bg-blue-100 text-blue-700"
            : displayStatus === "Scheduled"
            ? "bg-orange-100 text-orange-700"
            : "bg-emerald-100 text-emerald-700",
      };
    });
};

export const getVisitorOverview = (visitors: VisitorWithVisits[]) => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const overview: Array<{
    visitor: string;
    host: string;
    checkIn: string;
    status: string;
    statusColor: string;
  }> = [];

  visitors.forEach((visitor) => {
    visitor.visits.forEach((visit) => {
      const scheduledDate = new Date(visit.scheduled_date);
      if (scheduledDate < todayStart || scheduledDate > todayEnd) return;

      const checkInTime = visit.check_in_time
        ? new Date(visit.check_in_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : scheduledDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

      let status = "Scheduled";
      let statusColor = "bg-orange-100 text-orange-700";

      if (visit.check_in_time && !visit.check_out_time) {
        status = "Checked In";
        statusColor = "bg-blue-100 text-blue-700";
      } else if (visit.check_out_time) {
        status = "Checked Out";
        statusColor = "bg-emerald-100 text-emerald-700";
      }

      overview.push({
        visitor: visitor.name,
        host: visit.host_name,
        checkIn: checkInTime,
        status,
        statusColor,
      });
    });
  });

  return overview.sort((a, b) => {
    const timeA = a.checkIn;
    const timeB = b.checkIn;
    return timeA.localeCompare(timeB);
  });
};

