import { useEffect, useMemo, useState } from "react";
import type { FilterState } from "@web/components/AdminComponents/AdminFilter";
import { useDebounce } from "../../hooks/useDebounce";
import { searchBookings } from "@/lib/search";
import {
  CalendarClock,
  CalendarDays,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import WeekCalendar from "@web/components/calendarWeek";
import DayCalendar from "@web/components/dayCalendar";
import MonthCalendar from "@web/components/monthCalendar";
import MyBooking from "@web/components/MyBooking";
import CalendarListView from "@web/components/CalendarListView";
import { BookingForm } from "@web/components/BookingForm";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@web/components/ui/dialog";
import AdminNavigation from "@web/components/AdminComponents/AdminNavigation";
import AdminStatus from "@web/components/AdminComponents/AdminStatus";
import { useAuth } from "../../contexts/AuthContext";
import { apiGetAllBookings, apiGetRooms, apiGetEmployees, apiCancelBooking, type Booking, type Room, type Employee } from "../../service/bookings";
import toast from "react-hot-toast";
import { handleApiError } from "@/lib/utils";

export default function BookingsCalendar() {
  const { isAdmin } = useAuth();
  const [day, setDay] = useState(true);
  const [week, setWeek] = useState(false);
  const [month, setMonth] = useState(false);
  const [mybookings, setmybookings] = useState(false);
  const [calendar, setcalendar] = useState(true);
  const [adminListView, setAdminListView] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [initialFormDate, setInitialFormDate] = useState<Date | null>(null);
  const [initialFormStartTime, setInitialFormStartTime] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myBookingsRefreshKey, setMyBookingsRefreshKey] = useState<number>(0);
  const [adminStatsRefreshKey, setAdminStatsRefreshKey] = useState<number>(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ status: null, date: null });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  function changeDaysWeeksMonth(e: number) {
    if (e == 1) {
      if (week || month) {
        setWeek(false);
        setMonth(false);
      }
      setDay(!day);
    } else if (e == 2) {
      if (day || month) {
        setDay(false);
        setMonth(false);
      }
      setWeek(!week);
    } else if (e == 3) {
      if (day || week) {
        setDay(false);
        setWeek(false);
      }
      setMonth(!month);
    }
  }
  function changeBetweenCalenderMyBooking(e: number) {
    if (e == 1) {
      setmybookings(false);
      setcalendar(true);
    } else if (e == 2) {
      setmybookings(true);
      setcalendar(false);
    }
  }

  const daysWeeksMonth = [
    { id: 1, text: "Day", icon: <CalendarClock />, onclick: false },
    { id: 2, text: "Week", icon: <CalendarDays />, onclick: false },
    { id: 3, text: "Month", icon: <Calendar />, onclick: false },
  ];
  const slideClick = [
    { id: 1, icon: <ChevronLeft /> },
    { id: 2, icon: <ChevronRight /> },
  ];
  const colorForTheChangeDayWeeMonth = "bg-primary text-white";
  const switchCalenderBookings = isAdmin
    ? [
        {
          id: 1,
          text: "Calendar View",
        },
        {
          id: 2,
          text: "List View",
        },
      ]
    : [
    {
      id: 1,
      text: "Calendar",
    },
    {
      id: 2,
      text: "My Bookings",
    },
  ];

  const formatMonthYear = (date: Date) =>
    date.toLocaleString(undefined, { month: "long", year: "numeric" });
  const onPrev = () => {
    if (day) setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  };
  const onNext = () => {
    if (day) setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  };
  const isCurrentDayToday =
    day &&
    currentDate.toDateString() === new Date().toDateString();
  const onToday = () => {
    if (!isCurrentDayToday) {
    setCurrentDate(new Date());
    }
  };

  //visible date range
  const visibleRange = useMemo(() => {
    if (day) {
      const start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    if (week) {
      const base = new Date(currentDate);
      const dow = base.getDay(); // 0..6
      const mondayOffset = (dow + 6) % 7;
      const start = new Date(base);
      start.setDate(base.getDate() - mondayOffset);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    // month
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }, [day, week, month, currentDate]);

  //fetch the rooms and employees on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [roomsData, employeesData] = await Promise.all([
          apiGetRooms(),
          apiGetEmployees(),
        ]);
        setRooms(roomsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error("Failed to load rooms or employees:", error);
      }
    };
    fetchInitialData();
  }, []);

  //fetch the bookings - for admin fetch all, for normal user's fetch visible range
  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let data: Booking[];
        if (isAdmin && adminListView) {
          //admin list view
          data = await apiGetAllBookings();
        } else if (isAdmin && !adminListView) {
          //admin calendar view
          const startISO = visibleRange.start.toISOString();
          const endISO = visibleRange.end.toISOString();
          data = await apiGetAllBookings({ start: startISO, end: endISO });
        } else if (!isAdmin && mybookings) {
          // regular user - my bookings
          data = [];
        } else {
          //regular use calendar view
          const startISO = visibleRange.start.toISOString();
          const endISO = visibleRange.end.toISOString();
          data = await apiGetAllBookings({ start: startISO, end: endISO });
        }
        if (!isCancelled) {
          setBookings(data);
        }
      } catch {
        if (!isCancelled) setError("Failed to load bookings");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isCancelled = true;
    };
  }, [isAdmin, adminListView, mybookings, visibleRange.start.getTime(), visibleRange.end.getTime()]);

  //helper function to get the staus of a booking
  const getBookingStatus = (booking: Booking): string => {
    const now = new Date();
    const end = new Date(booking.end_time);
    const start = new Date(booking.start_time);
    const status = booking.status || "Scheduled";

    // If status is already "Completed" from backend, use it
    if (status === "Completed") {
      return "Completed";
    }

    // Check if booking is ongoing (current time is between start and end)
    if (now >= start && now <= end && status === "Confirmed") {
      return "Ongoing";
    }

    // Check if booking is completed (Confirmed and end time is past)
    if (status === "Confirmed" && now > end) {
      return "Completed";
    }

    return status;
  };

  // Filter bookings for list view
  const filteredBookings = useMemo(() => {
    if (!isAdmin || !adminListView) {
      return bookings;
    }

    let result = bookings;

    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      result = searchBookings(result, debouncedSearchTerm, rooms, employees);
    }

    // Apply status and date filters
    result = result.filter((booking) => {
      // Filter by status
      if (filters.status) {
        const actualStatus = getBookingStatus(booking);
        if (actualStatus !== filters.status) {
          return false;
        }
      }

      // Filter by date
      if (filters.date) {
        const bookingDate = new Date(booking.start_time);
        const filterDate = new Date(filters.date);
        
        // Compare dates (ignore time)
        const bookingDateOnly = new Date(
          bookingDate.getFullYear(),
          bookingDate.getMonth(),
          bookingDate.getDate()
        );
        const filterDateOnly = new Date(
          filterDate.getFullYear(),
          filterDate.getMonth(),
          filterDate.getDate()
        );

        if (bookingDateOnly.getTime() !== filterDateOnly.getTime()) {
          return false;
        }
      }

      return true;
    });

    return result;
  }, [bookings, filters, debouncedSearchTerm, rooms, employees, isAdmin, adminListView]);

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col gap-5 flex-shrink-0 overflow-x-hidden">
        {!isAdmin && (
          <div className="flex justify-between items-center">
            <div className={`grid gap-2`}>
              <div className="flex w-[419.44px] bg-white shadow text-[19.44px] h-[50px]  justify-evenly rounded-[19.44px] overflow-hidden items-center">
                {switchCalenderBookings.map((each) => {
                  return (
                    <div
                      key={each.id}
                      className={`w-[204.17px] h-[40.28px] rounded-[19.44px]  flex items-center justify-center cursor-pointer select-none
                        ${
                          each.id == 2 && mybookings
                            ? colorForTheChangeDayWeeMonth
                            : each.id == 1 && calendar
                            ? colorForTheChangeDayWeeMonth
                            : "bg-white"
                        }`}
                      onClick={() => changeBetweenCalenderMyBooking(each.id)}
                    >
                      <p>{each.text}</p>
                    </div>
                  );
                })}
              </div>
              <p className={`text-[#717182] ${calendar ? "block" : "hidden"}`}>
                {formatMonthYear(currentDate)}
              </p>
            </div>

            <div
              className={`flex w-[314px] h-[50px] justify-evenly items-center gap-2.5 rounded-[10px] border-[0.67px] border-[#e5e7eb] shadow bg-white text-[rgb(113,113,130,1)] ${
                calendar ? "flex" : "hidden"
              }`}
            >
              {daysWeeksMonth.map((e) => {
                return (
                  <div
                    key={e.id}
                    className={`flex 
                      ${
                        day && e.id == 1
                          ? colorForTheChangeDayWeeMonth
                          : week && e.id == 2
                          ? colorForTheChangeDayWeeMonth
                          : month && e.id == 3
                          ? colorForTheChangeDayWeeMonth
                          : "bg-white"
                      }
                      
                    font-normal rounded-xl w-[85.28px] gap-1 h-10 justify-center items-center cursor-pointer select-none`}
                    onClick={() => changeDaysWeeksMonth(e.id)}
                  >
                    {/* Icon container */}
                    <div className="w-4 h-4 flex items-center">{e.icon}</div>
                    {/* Text feild */}
                    <div>{e.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Admin status view */}
        {isAdmin && (
          <div>
            <AdminStatus isAdmin={isAdmin} refreshKey={adminStatsRefreshKey} />
          </div>
        )}
      </div>

      {/* Content Section(calendar)*/}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden mt-5">
        {/* My Bookings View - Only for regular users */}
        {!isAdmin && (
          <div className={`${calendar ? "hidden" : "flex flex-col"} h-full overflow-y-auto`}>
            <MyBooking
              rooms={rooms}
              employees={employees}
              refreshKey={myBookingsRefreshKey}
              onReschedule={(booking) => {
                setSelectedBooking(booking);
                setInitialFormDate(null);
                setInitialFormStartTime(null);
                setIsBookingDialogOpen(true);
              }}
              onCancel={async (bookingId) => {
                try {
                  await apiCancelBooking(bookingId);
                  toast.success("Booking cancelled successfully");
                  // Refresh my bookings
                  setMyBookingsRefreshKey((k) => k + 1);
                  // Also refresh admin bookings if admin
                  if (isAdmin) {
                    setAdminStatsRefreshKey((k) => k + 1);
                  }
                } catch (error) {
                  const errorMessage = handleApiError(
                    error,
                    "Failed to cancel booking. Please try again.",
                    "BookingsCalendar.onCancel"
                  );
                  toast.error(errorMessage);
                }
              }}
            />
          </div>
        )}

        {/* Calendar View - For both admin and regular users */}
        <div className={`${(!isAdmin && mybookings) ? "hidden" : "flex flex-col"} h-full overflow-hidden`}>
          {/* Calendar Controls */}
          <div className="flex flex-shrink-0 justify-between items-center mb-3">
            {/* the Admin View */}
            <div className={`${isAdmin ? "block" : "hidden"}`}>
              <AdminNavigation 
                isListView={adminListView}
                onViewChange={(isListView) => {
                  setAdminListView(isListView);
                  if (!isListView) {
                    // Clear filters and search when switching to calendar view
                    setFilters({ status: null, date: null });
                    setSearchTerm("");
                  }
                }}
                onCalendarViewChange={(view) => {
                  if (view === 'day') {
                    setDay(true);
                    setWeek(false);
                    setMonth(false);
                  } else if (view === 'week') {
                    setDay(false);
                    setWeek(true);
                    setMonth(false);
                  } else if (view === 'month') {
                    setDay(false);
                    setWeek(false);
                    setMonth(true);
                  }
                }}
                currentCalendarView={day ? 'day' : week ? 'week' : 'month'}
                onFilterChange={(newFilters) => {
                  setFilters(newFilters);
                }}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
            <div
              className={`flex items-center gap-4 ${isAdmin ? "hidden" : ""}`}
            >
              {slideClick.map((e) => {
                return (
                  <div
                    key={e.id}
                    className="flex items-center cursor-pointer select-none justify-center w-[36px] rounded-[10px] p-[8.67px] text-[#ABABAB] border-[0.67px] border-[#e5e7eb] h-[36px] shadow"
                    onClick={e.id === 1 ? onPrev : onNext}
                  >
                    {e.icon}
                  </div>
                );
              })}
              <button
                type="button"
                className={`flex items-center justify-center rounded-[10px] p-[8.67px] h-9 shadow border-[0.67px] border-[#e5e7eb] ${
                  isCurrentDayToday
                    ? "cursor-not-allowed select-none text-[#ABABAB]/60 bg-gray-100"
                    : "cursor-pointer select-none text-[#ABABAB] hover:bg-gray-50 transition-colors"
                }`}
                onClick={onToday}
                disabled={isCurrentDayToday}
              >
                Today
              </button>
            </div>
            {/* making booking */}
            <Dialog
              open={isBookingDialogOpen}
              onOpenChange={(open) => {
                setIsBookingDialogOpen(open);
                if (!open) {
                  setSelectedBooking(null);
                  setInitialFormDate(null);
                  setInitialFormStartTime(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <div className="flex rounded-[10px] bg-primary cursor-pointer select-none gap-1 text-white items-center justify-center w-[168px] h-[43px] text-[14px] hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />
                  <p>Make a Booking</p>
                </div>
              </DialogTrigger>
              <DialogContent
                className="max-w-[500px] p-0"
                showCloseButton={false}
              >
                <DialogTitle className="sr-only">
                  {selectedBooking ? "Update Booking" : "Make a Booking"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {selectedBooking 
                    ? "Update your booking details"
                    : "Fill out the form to book a meeting room"}
                </DialogDescription>
                <BookingForm
                  booking={selectedBooking}
                  initialDate={initialFormDate}
                  initialStartTime={initialFormStartTime}
                  onCancel={() => {
                    setIsBookingDialogOpen(false);
                    setSelectedBooking(null);
                    setInitialFormDate(null);
                    setInitialFormStartTime(null);
                  }}
                  onBookingCancelled={() => {
                    // Refresh bookings after cancellation
                    if (isAdmin && adminListView) {
                      // Admin List View - refetch all bookings
                      apiGetAllBookings().then(setBookings);
                    } else {
                      // Calendar view - refetch visible range
                      const startISO = visibleRange.start.toISOString();
                      const endISO = visibleRange.end.toISOString();
                      apiGetAllBookings({ start: startISO, end: endISO }).then(setBookings);
                    }
                    // trigger MyBookings and AdminStats to refresh as well
                    setMyBookingsRefreshKey((k) => k + 1);
                    setAdminStatsRefreshKey((k) => k + 1);
                  }}
                  onSubmit={() => {
                    setIsBookingDialogOpen(false);
                    setSelectedBooking(null);
                    setInitialFormDate(null);
                    setInitialFormStartTime(null);
                    //after update - refetch bookings
                    if (isAdmin && adminListView) {
                      // Admin List View - refetch all bookings
                      apiGetAllBookings().then(setBookings);
                    } else {
                      // Calendar view - refetch visible range
                      const startISO = visibleRange.start.toISOString();
                      const endISO = visibleRange.end.toISOString();
                      apiGetAllBookings({ start: startISO, end: endISO }).then(setBookings);
                    }
                    // trigger MyBookings and AdminStats to refresh as well
                    setMyBookingsRefreshKey((k) => k + 1);
                    setAdminStatsRefreshKey((k) => k + 1);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Calendar Component Container */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {isAdmin && adminListView ? (
              // Admin List View
              <CalendarListView
                bookings={filteredBookings}
                rooms={rooms}
                employees={employees}
                isLoading={isLoading}
                error={error}
                onBookingClick={(booking) => {
                  setSelectedBooking(booking);
                  setInitialFormDate(null);
                  setInitialFormStartTime(null);
                  setIsBookingDialogOpen(true);
                }}
              />
            ) : (
              // Calendar View (Day/Week/Month)
              <>
                {isLoading && <div className="p-4 text-sm text-[#717182]">Loading bookings…</div>}
                {error && <div className="p-4 text-sm text-red-600">{error}</div>}
                {!isLoading && !error && (
                  <>
                    {day ? (
                      <DayCalendar 
                        currentDate={currentDate} 
                        bookings={bookings}
                        rooms={rooms}
                        employees={employees}
                        onBookingClick={(booking) => {
                          setSelectedBooking(booking);
                          setInitialFormDate(null);
                          setInitialFormStartTime(null);
                          setIsBookingDialogOpen(true);
                        }}
                        onCellClick={(date, hour) => {
                          setSelectedBooking(null);
                          setInitialFormDate(date);
                          // Format hour as HH:mm
                          const timeString = `${hour.toString().padStart(2, '0')}:00`;
                          setInitialFormStartTime(timeString);
                          setIsBookingDialogOpen(true);
                        }}
                        onPrevDay={onPrev}
                        onNextDay={onNext}
                        isAdmin={isAdmin}
                      />
                    ) : week ? (
                      <WeekCalendar 
                        bookings={bookings}
                        rooms={rooms}
                        employees={employees}
                        currentDate={currentDate}
                        onBookingClick={(booking) => {
                          setSelectedBooking(booking);
                          setInitialFormDate(null);
                          setInitialFormStartTime(null);
                          setIsBookingDialogOpen(true);
                        }}
                        onCellClick={(date, hour) => {
                          setSelectedBooking(null);
                          setInitialFormDate(date);
                          const timeString = `${hour.toString().padStart(2, '0')}:00`;
                          setInitialFormStartTime(timeString);
                          setIsBookingDialogOpen(true);
                        }}
                      />
                    ) : month ? (
                      <MonthCalendar 
                        bookings={bookings}
                        currentDate={currentDate}
                        onCellClick={(date, hour) => {
                          setSelectedBooking(null);
                          setInitialFormDate(date);
                          const timeString = `${hour.toString().padStart(2, '0')}:00`;
                          setInitialFormStartTime(timeString);
                          setIsBookingDialogOpen(true);
                        }}
                      />
                    ) : (
                      "Page not Found"
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
