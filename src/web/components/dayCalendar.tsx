import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Booking, Room, Employee } from "@web/conference-and-visitors-booking/service/bookings";

type DayCalendarProps = {
  currentDate: Date;
  bookings?: Booking[];
  rooms?: Room[];
  employees?: Employee[];
  onBookingClick?: (booking: Booking) => void;
  onCellClick?: (date: Date, hour: number) => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  isAdmin?: boolean;
};

export default function dayCalendar({ 
  currentDate, 
  bookings = [], 
  rooms = [],
  employees = [],
  onBookingClick, 
  onCellClick,
  onPrevDay,
  onNextDay,
  isAdmin = false
}: DayCalendarProps) {
  const [cell, setCell] = useState(Array(24).fill(""));
  function ClickOnMonth(index: number) {
    const newCell = [...cell];
    newCell[index] = prompt("What booking are you making today");
    setCell(newCell);
  }
  
  // Generate 24 hours from 12 AM to 11 PM
  const time = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      id: i + 1,
      hour: displayHour,
      period,
      fullHour: hour,
    };
  });
  const headerDate = currentDate.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const headerWeekday = currentDate.toLocaleString(undefined, { weekday: "long" });
  const BORDER_COLOR = "rgba(171, 171, 171, 1)";
  const BORDER_STYLE = `0.67px solid ${BORDER_COLOR}`;

  // Create lookup maps for rooms and employees
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

  //get bookings for the current day with the positions
  const dayBookings = useMemo(() => {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    return bookings
      .filter((b) => {
        const start = new Date(b.start_time);
        const end = new Date(b.end_time);
        //show bookings that overlap with the current day
        return start <= dayEnd && end >= dayStart;
      })
      .map((booking) => {
        const start = new Date(booking.start_time);
        const end = new Date(booking.end_time);
        
        //calculate position of booking, each minute is 1px, hour is 80px (changed from 60px)
        const dayStartTime = new Date(currentDate);
        dayStartTime.setHours(0, 0, 0, 0);
        const bookingStart = start < dayStartTime ? dayStartTime : start;
        const bookingEnd = end > dayEnd ? dayEnd : end;
        
        const startMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes();
        const endMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();
        // Convert minutes to pixels: each hour is 80px, so each minute is 80/60 = 1.333px
        const top = startMinutes * (80 / 60);
        const height = (endMinutes - startMinutes) * (80 / 60);
        
        return {
          ...booking,
          top,
          height,
          startMinutes,
          endMinutes,
        };
      })
      .sort((a, b) => a.startMinutes - b.startMinutes);
  }, [bookings, currentDate]);

  return (
    <div
      className="h-full w-full flex flex-col rounded-[10px] overflow-hidden"
      style={{ border: BORDER_STYLE }}
    >
      {/* Scrollable calendar area */}
      <div className="flex flex-1 overflow-y-auto min-h-0">
        {/* time field */}
        <div className="w-[100px] flex-shrink-0" style={{ height: `${24 * 80}px`, minHeight: `${24 * 80}px` }}>
          {time.map((eachtime, index) => {
            return (
              <div
                key={eachtime.id}
                className="flex flex-col items-end justify-start w-full h-[80px] pr-[24px] pt-[20px]"
                style={{
                  borderRight: BORDER_STYLE,
                  borderTop: index === 0 ? undefined : BORDER_STYLE,
                  borderBottom: index === time.length - 1 ? BORDER_STYLE : undefined,
                }}
              >
                <p className="text-[14px] text-[#717182] text-right">
                  {eachtime.hour}:00 {eachtime.period}
                </p>
              </div>
            );
          })}
        </div>
        {/*render calendar with bookings*/}
        <div className="flex-1 w-full relative" style={{ height: `${24 * 80}px`, minHeight: `${24 * 80}px` }}>
          {/* Hour cells - clickable background */}
          {cell.map(( index) => (
            <div
              key={index}
              onClick={() => {
                if (onCellClick) {
                  const cellDate = new Date(currentDate);
                  cellDate.setHours(index, 0, 0, 0);
                  onCellClick(cellDate, index);
                } else {
                  ClickOnMonth(index);
                }
              }}
              className="absolute w-full cursor-pointer hover:bg-gray-50/50 transition-colors"
              style={{
                top: `${index * 80}px`,
                height: "80px",
                left: 0,
                right: 0,
                borderTop: index === 0 ? undefined : BORDER_STYLE,
                borderBottom: index === cell.length - 1 ? BORDER_STYLE : undefined,
              }}
            />
          ))}

          {/*bookings modal*/}
          {dayBookings.map((booking) => {
            const roomName = booking.room_name || roomMap.get(booking.room_id) || `Room ${booking.room_id}`;
            const bookerName = employeeMap.get(booking.user_id) || `User ${booking.user_id}`;
            const attendeeCount = booking.attendees?.length || 0;
            const start = new Date(booking.start_time);
            const end = new Date(booking.end_time);
            const timeLabel = `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
            const bookingTitle = booking.purpose || "Booking";
            const cardHeight = Math.max(booking.height - 16, 64);
            const isSmallCard = cardHeight < 100;
            
            return (
              <div
                key={booking.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookingClick?.(booking);
                }}
                className="absolute left-[8px] right-[8px] bg-[rgba(2,77,44,0.4)] text-white rounded-[8px] cursor-pointer hover:opacity-95 transition-opacity overflow-hidden flex flex-col"
                style={{
                  top: `${booking.top + 8}px`,
                  height: `${cardHeight}px`,
                  padding: isSmallCard ? '8px 12px' : '16px',
                  gap: isSmallCard ? '2px' : '4px',
                  opacity: 0.95,
                  zIndex: 10,
                  boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
                }}
              >
                {/* Left border bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[8px] bg-[rgba(2,77,44,0.8)] rounded-l-[8px]" />
                
                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0" style={{ gap: isSmallCard ? '2px' : '4px' }}>
                  <div className={`${isSmallCard ? 'text-[14px] leading-[18px]' : 'text-[16px] leading-[24px]'} font-bold text-white truncate`}>
                    {bookingTitle}
                  </div>
                  <div className={`${isSmallCard ? 'text-[12px] leading-[16px]' : 'text-[14px] leading-[20px]'} text-[rgba(255,255,255,0.9)]`}>
                    {timeLabel}
                  </div>
                  <div className={`flex flex-wrap gap-x-2 gap-y-0 ${isSmallCard ? 'text-[10px] leading-[14px]' : 'text-[12px] leading-[16px]'} text-[rgba(255,255,255,0.8)]`}>
                    <span className="whitespace-nowrap">{roomName}</span>
                    <span className="whitespace-nowrap">
                      {attendeeCount} {attendeeCount === 1 ? 'attendee' : 'attendees'}
                    </span>
                    <span className="whitespace-nowrap">• {bookerName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/*footer*/}
      <div className="flex-shrink-0 flex flex-col gap-[4px] px-[24px] pt-[24px] pb-[0.667px]" style={{ borderTop: BORDER_STYLE }}>
        <div className="flex items-center gap-2">
          {isAdmin && onPrevDay && (
            <button
              onClick={onPrevDay}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5 text-[#202224]" />
            </button>
          )}
          <div className="flex-1">
            <div className="text-[16px] font-semibold leading-[36px] text-[#202224]">
              {headerDate}
            </div>
            <div className="text-[14px] leading-[20px] text-[#717182]">{headerWeekday}</div>
          </div>
          {isAdmin && onNextDay && (
            <button
              onClick={onNextDay}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5 text-[#202224]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
