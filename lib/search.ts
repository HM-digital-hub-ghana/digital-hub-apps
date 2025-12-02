import type { Booking, Room, Employee } from '@/service/bookings';

export interface BookingSearchResult {
  booking: Booking;
  matchedFields: string[];
}

export function searchBookings(
  bookings: Booking[],
  searchTerm: string,
  rooms: Room[] = [],
  employees: Employee[] = []
): Booking[] {
  if (!searchTerm.trim()) {
    return bookings;
  }

  const searchLower = searchTerm.toLowerCase().trim();
  const roomMap = new Map<number, string>();
  rooms.forEach((room) => {
    if (room?.name) {
      roomMap.set(room.id, room.name.toLowerCase());
    }
  });

  const employeeMap = new Map<number, string>();
  employees.forEach((emp) => {
    if (emp?.employee_name) {
      employeeMap.set(emp.id, emp.employee_name.toLowerCase());
    }
  });

  return bookings.filter((booking) => {
    const meetingTitle = (booking.purpose || '').toLowerCase();
    const roomName = roomMap.get(booking.room_id) || '';
    const hostName = employeeMap.get(booking.user_id) || '';

    return (
      meetingTitle.includes(searchLower) ||
      roomName.includes(searchLower) ||
      hostName.includes(searchLower)
    );
  });
}

