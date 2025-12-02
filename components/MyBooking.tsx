import { Clock, MapPin, Users, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiGetMyBookings, type Booking, type Room, type Employee } from "@/service/bookings";

export default function MyBooking({
  rooms = [],
  onReschedule,
  onCancel,
  refreshKey = 0,
}: {
  rooms?: Room[];
  employees?: Employee[];
  onReschedule?: (booking: Booking) => void;
  onCancel?: (bookingId: number) => Promise<void>;
  refreshKey?: number;
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);

  const roomMap = useMemo(() => {
    const map = new Map<number, string>();
    rooms.forEach((r) => map.set(r.id, r.name));
    return map;
  }, [rooms]);


  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        //we are fetching all users here, we can limit it to the visible range
        const data = await apiGetMyBookings();
        setBookings(data);
      } catch {
        setError("Failed to load your bookings");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [refreshKey]);

  const now = new Date();
  const { upcoming, history } = useMemo(() => {
    const upcoming: Booking[] = [];
    const history: Booking[] = [];
    bookings.forEach((b) => {
      const isCancelled = b.status?.toLowerCase() === "cancelled";
      const end = new Date(b.end_time);
      // Cancelled bookings always go to history, regardless of date
      if (isCancelled || end < now) {
        history.push(b);
      } else {
        upcoming.push(b);
      }
    });
    //sort by start time ascending for upcoming
    upcoming.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    history.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
    return { upcoming, history };
  }, [bookings]);

  const formatRange = (startISO: string, endISO: string) => {
    const s = new Date(startISO);
    const e = new Date(endISO);
    const time = `${s.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${e.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    const dateLabel = s.toDateString() === now.toDateString()
      ? "Today"
      : s.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
      ? "Tomorrow"
      : s.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return { time, dateLabel };
  };

  const getStatusBadge = (booking: Booking) => {
    const now = new Date();
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    
    if (start <= now && end >= now) {
      return { text: "Ongoing", className: "text-[#3488dd]" };
    }
    return { text: "Upcoming", className: "text-[#ffc107]" };
  };

  const toCard = (b: Booking) => {
    const { time, dateLabel } = formatRange(b.start_time, b.end_time);
    const roomName = b.room_name || roomMap.get(b.room_id) || `Room ${b.room_id}`;
    const attendeeText = `${b.attendees?.length ?? 0} ${((b.attendees?.length ?? 0) === 1) ? "attendee" : "attendees"}`;
    const status = b.status || "Scheduled";
    return {
      booking: b,
      id: b.id,
      text: b.purpose || "Booking",
      icons: [
        { icon: <Clock className="w-[11px]" />, id: 1 },
        { icon: <Users className="w-4" />, id: 2 },
        { icon: <MapPin className="w-4" />, id: 3 },
      ] as const,
      date: dateLabel,
      locate: roomName,
      time,
      attendees: attendeeText,
      status: [status],
      isCancelled: status?.toLowerCase() === "cancelled",
    };
  };

  const upcomingCards = upcoming.map(toCard);
  const historyCards = history.map(toCard);

  return (
    <div className="flex flex-col gap-[10px]">
      {/* My Bookings */}
      <div className="bg-white border-[0.667px] border-gray-200 border-solid rounded-[10px] w-full">
        {/* Header */}
        <div className="border-b-[0.667px] border-gray-200 border-l-0 border-r-0 border-solid border-t-0 flex flex-col gap-[4px] px-[16px] pt-[24px] pb-[0.667px]">
          <h1 className="font-bold text-[20px] leading-[28px] text-neutral-950">My Bookings</h1>
          <p className="font-normal text-[#717182] text-[16px] leading-[24px]">
            Your upcoming scheduled bookings
          </p>
        </div>

        {/* Bookings Cards */}
        <div className="flex gap-[16px] px-[16px] py-[10px]">
          {isLoading && <div className="text-sm text-[#717182] px-4 py-6">Loading…</div>}
          {error && <div className="text-sm text-red-600 px-4 py-6">{error}</div>}
          {!isLoading && !error && upcomingCards.length === 0 && (
            <div className="text-sm text-[#717182] px-4 py-6">No upcoming bookings</div>
          )}
          {!isLoading && !error && upcomingCards.slice(0, 3).map((each, index) => {
            const statusBadge = getStatusBadge(each.booking);
            return (
              <div
                key={`booking-${each.id}-${index}`}
                className="bg-white border-[0.667px] border-gray-200 border-solid flex-1 flex flex-col rounded-[10px] min-w-0"
              >
                <div className="flex flex-col gap-[10px] px-[16px] pt-[16.667px] pb-[16px]">
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-[8px] items-center flex-1 min-w-0">
                        <div className="bg-[#024d2c] h-[32px] w-[4px] rounded-[22369600px] shrink-0" />
                        <div className="flex flex-col gap-[4px] min-w-0">
                          <h2 className="font-bold text-[16px] leading-[24px] text-neutral-950">{each.text}</h2>
                          <div className="flex items-center gap-[6px] text-[#717182] text-[14px] leading-[20px]">
                            <Clock className="w-[14px] h-[14px] shrink-0" />
                            <span>{each.time}</span>
                            <span>•</span>
                            <span>{each.date}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[12px] leading-[16px] font-normal shrink-0 ${statusBadge.className}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                    <div className="flex gap-[16px] items-center">
                      <div className="flex items-center gap-[6px] text-[#717182] text-[14px] leading-[20px]">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{each.locate}</span>
                      </div>
                      <div className="flex items-center gap-[6px] text-[#717182] text-[14px] leading-[20px]">
                        <Users className="w-4 h-4 shrink-0" />
                        <span>{each.attendees}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t-[0.667px] border-gray-100 border-solid flex gap-[8px] px-[16px] pt-[12.667px] pb-[0.667px]">
                  <button
                    type="button"
                    onClick={async () => {
                      if (onCancel) {
                        setCancellingBookingId(each.booking.id);
                        try {
                          await onCancel(each.booking.id);
                        } finally {
                          setCancellingBookingId(null);
                        }
                      }
                    }}
                    disabled={cancellingBookingId === each.booking.id}
                    className="bg-white border-[0.8px] border-[rgba(255,0,0,0.8)] border-solid flex-1 h-[33.333px] rounded-[8px] flex items-center justify-center text-[rgba(255,0,0,0.8)] text-[14px] leading-[20px] font-normal hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancellingBookingId === each.booking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Cancel Booking"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onReschedule?.(each.booking)}
                    className="bg-white border-[0.8px] border-[#717182] border-solid flex-1 h-[33.333px] rounded-[8px] flex items-center justify-center text-[#717182] text-[14px] leading-[20px] font-normal hover:opacity-80 transition-opacity"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking History */}
      <div className="bg-white border-[0.667px] border-gray-200 border-solid rounded-[10px] w-full">
        {/* Header */}
        <div className="border-b-[0.667px] border-gray-200 border-l-0 border-r-0 border-solid border-t-0 flex flex-col gap-[4px] px-[16px] pt-[24px] pb-[0.667px]">
          <h1 className="font-bold text-[20px] leading-[28px] text-neutral-950">Booking History</h1>
          <p className="font-normal text-[#717182] text-[16px] leading-[24px]">
            Your past bookings and meeting history
          </p>
        </div>

        {/* History Cards */}
        <div className="flex flex-col gap-[10px] px-[16px] py-[10px]">
          <div className="flex flex-col gap-[12px]">
            <div className="flex gap-[16px] items-center">
              {isLoading && <div className="text-sm text-[#717182] px-4 py-6">Loading…</div>}
              {error && <div className="text-sm text-red-600 px-4 py-6">{error}</div>}
              {!isLoading && !error && historyCards.length === 0 && (
                <div className="text-sm text-[#717182] px-4 py-6">No booking history</div>
              )}
              {!isLoading && !error && historyCards.slice(0, 3).map((each, index) => {
                return (
                  <div
                    key={`history-${each.id}-${index}`}
                    className="bg-white border-[0.667px] border-gray-200 border-solid flex-1 h-[117.333px] rounded-[10px] min-w-0"
                  >
                    <div className="flex flex-col gap-[4px] px-[16.67px] pt-[16.67px]">
                      <h2 className="font-bold text-[16px] leading-[24px] text-neutral-950">{each.text}</h2>
                      <div className="flex items-center gap-[6px] text-[#717182] text-[14px] leading-[20px]">
                        <Clock className="w-[14px] h-[14px] shrink-0" />
                        <span>{each.time}</span>
                        <span>•</span>
                        <span>{each.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-[16px] items-center px-[16.67px] pt-[16px]">
                      <div className="flex items-center gap-[6px] text-[#717182] text-[14px] leading-[20px]">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{each.locate}</span>
                      </div>
                      <div className="flex items-center gap-[6px] text-[#717182] text-[14px] leading-[20px]">
                        <Users className="w-4 h-4 shrink-0" />
                        <span>{each.attendees}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
