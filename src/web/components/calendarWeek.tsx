import { useState, useEffect, useRef, useMemo } from "react";
import type { Booking, Room, Employee } from "@web/conference-and-visitors-booking/service/bookings";

const BORDER_COLOR = "rgba(171, 171, 171, 1)";
const BORDER_STYLE = `0.67px solid ${BORDER_COLOR}`;

type WeekCalendarProps = {
  bookings?: Booking[];
  rooms?: Room[];
  employees?: Employee[];
  onBookingClick?: (booking: Booking) => void;
  onCellClick?: (date: Date, hour: number) => void;
  currentDate?: Date;
};

export default function WeekCalendar({ 
  bookings = [] as Booking[], 
  rooms = [] as Room[],
  employees = [] as Employee[],
  onBookingClick,
  onCellClick,
  currentDate = new Date()
}: WeekCalendarProps) {
  // 7 days × 24 hours = 168 cells
  const [cell, setCell] = useState(Array(168).fill(""));
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [gridWidth, setGridWidth] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerGridRef = useRef<HTMLDivElement>(null);
  const bodyGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateWidths = () => {
      if (scrollContainerRef.current && bodyGridRef.current) {
        //scrollbar width
        const hasScrollbar = scrollContainerRef.current.scrollHeight > scrollContainerRef.current.clientHeight;
        if (hasScrollbar) {
          const scrollbarWidth = scrollContainerRef.current.offsetWidth - scrollContainerRef.current.clientWidth;
          setScrollbarWidth(scrollbarWidth);
        } else {
          setScrollbarWidth(0);
        }
        
        //set grid width
        if (bodyGridRef.current) {
          const width = bodyGridRef.current.offsetWidth;
          setGridWidth(width);
        }
      }
    };

    //calculate widths
    calculateWidths();
    
    //timeout to make sure content is rendered
    const timeoutId = setTimeout(calculateWidths, 100);
    
    //calculate again after resize
    window.addEventListener('resize', calculateWidths);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateWidths);
    };
  }, [cell]); // Recalculate when cell data changes

  function ClickOnMonth(index: number) {
    const newCell = [...cell];
    newCell[index] = prompt("What booking are you making this week");
    setCell(newCell);
  }
  const weekStart = useMemo(() => {
    const base = new Date(currentDate);
    const dayOfWeek = base.getDay();
    const mondayOffset = (dayOfWeek + 6) % 7;
    const monday = new Date(base);
    monday.setDate(base.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [currentDate]);

  const today = new Date();
  
  const days = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const isToday =
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
      return {
        id: i + 1,
        text: labels[i],
        day: d.getDate(),
        isToday,
      };
    });
  }, [weekStart, today]);

  //create lookup map for rooms and employees
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
  
  //get all bookings for the week
  const weekBookings = useMemo(() => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return bookings
      .filter((b) => {
        const start = new Date(b.start_time);
        const end = new Date(b.end_time);
        //check if booking overlaps with week
        return start <= weekEnd && end >= weekStart;
      })
      .map((booking) => {
        const start = new Date(booking.start_time);
        const end = new Date(booking.end_time);
        
        //calculate dat off set relative to the week
        const startDateOnly = new Date(start);
        startDateOnly.setHours(0, 0, 0, 0);
        const weekStartDateOnly = new Date(weekStart);
        weekStartDateOnly.setHours(0, 0, 0, 0);
        const diffTime = startDateOnly.getTime() - weekStartDateOnly.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const dayOffset = Math.max(0, Math.min(6, diffDays));
        
        //calculate the exact position within the day
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();
        const top = startMinutes; //1px is 1 minute
        const height = endMinutes - startMinutes;
        
        return {
          ...booking,
          dayOffset,
          top,
          height,
          startMinutes,
          endMinutes,
        };
      })
      .sort((a, b) => {
        if (a.dayOffset !== b.dayOffset) return a.dayOffset - b.dayOffset;
        return a.startMinutes - b.startMinutes;
      });
  }, [bookings, weekStart]);
  
  //generate 24 hours, from 12 to 11
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

  const totalRows = time.length;

  return (
    <div
      className="h-full w-full flex flex-col text-[14px] rounded-[10px] overflow-hidden shadow"
      style={{ border: BORDER_STYLE }}
    >
      {/*Days*/}
      <div
        className="flex flex-shrink-0"
        style={{ paddingRight: `${scrollbarWidth}px`, borderBottom: BORDER_STYLE }}
      >
          {/*space mathcing clumn width*/}
          <div
            className="w-[100px] flex-shrink-0"
            style={{ borderRight: BORDER_STYLE }}
          ></div>
          {/*days header*/}
          <div 
            ref={headerGridRef}
            className="flex-1 grid" 
            style={{ 
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', 
              gap: 0,
              width: gridWidth > 0 ? `${gridWidth}px` : 'auto'
            }}
          >
            {days.map((e, index) => {
              return (
                <div 
                  key={e.id} 
                  className="flex flex-col items-center justify-center py-2 relative"
                  style={{
                    boxSizing: "border-box",
                    borderRight: index < days.length - 1 ? BORDER_STYLE : undefined,
                  }}
                >
                  <p className="text-[14px] text-[#717182]">{e.text}</p>
                  <p className={`font-[600] text-[20px] ${e.isToday ? 'text-red-500' : ''}`}>{e.day}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/*scrollable body*/}
        <div 
          ref={scrollContainerRef}
          className="flex flex-1 overflow-y-auto min-h-0"
        >
          {/*wrap time colum and calendar - to scroll together*/}
          <div className="flex w-full">
            {/*time column*/}
            <div
              className="w-[100px] flex-shrink-0 flex flex-col"
              style={{ height: `${24 * 60}px`, borderRight: BORDER_STYLE }}
            >
              {time.map((e, index) => {
                return (
                  <div
                    key={e.id}
                    className="grid place-content-center h-[60px] flex-shrink-0"
                    style={{
                      borderTop: index !== 0 ? BORDER_STYLE : undefined,
                      borderBottom: index === time.length - 1 ? BORDER_STYLE : undefined,
                    }}
                  >
                    <p className="text-[12px] text-[#717182]">{e.hour}:00 {e.period}</p>
                  </div>
                );
              })}
            </div>

            {/*calendar body grid*/}
            <div 
              ref={bodyGridRef}
              className="flex-1 relative" 
              style={{ 
                height: `${24 * 60}px`,
                width: '100%'
              }}
            >
              {/*hour cells*/}
              {cell.map((_, index) => {
                const rowIndex = Math.floor(index / 7);
                const colIndex = index % 7;
                const slotHour = rowIndex;
                const slotDay = new Date(weekStart);
                slotDay.setDate(weekStart.getDate() + colIndex);
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (onCellClick) {
                        const cellDate = new Date(slotDay);
                        cellDate.setHours(slotHour, 0, 0, 0);
                        onCellClick(cellDate, slotHour);
                      } else {
                        ClickOnMonth(index);
                      }
                    }}
                    className="absolute cursor-pointer hover:bg-gray-50/50 transition-colors"
                    style={{ 
                      left: `${(colIndex / 7) * 100}%`,
                      width: `${100 / 7}%`,
                      top: `${rowIndex * 60}px`,
                      height: '60px', 
                      boxSizing: 'border-box',
                      borderTop: rowIndex !== 0 ? BORDER_STYLE : undefined,
                      borderRight: colIndex < 6 ? BORDER_STYLE : undefined,
                      borderBottom: rowIndex === totalRows - 1 ? BORDER_STYLE : undefined,
                    }}
                  />
                );
              })}

              {/*bookings modal*/}
              {weekBookings.map((booking) => {
                const roomName = booking.room_name || roomMap.get(booking.room_id) || `Room ${booking.room_id}`;
                const bookerName = employeeMap.get(booking.user_id) || `User ${booking.user_id}`;
                const attendeeCount = booking.attendees?.length || 0;
                const start = new Date(booking.start_time);
                const end = new Date(booking.end_time);
                const timeLabel = `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                
                return (
                  <div
                    key={booking.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingClick?.(booking);
                    }}
                    className="absolute bg-[rgba(2,77,44,0.4)] text-white rounded-[8px] pt-[16px] px-[16px] cursor-pointer hover:opacity-95 transition-opacity overflow-hidden flex flex-col gap-[4px]"
                    style={{
                      left: `calc(${(booking.dayOffset / 7) * 100}% + 8px)`,
                      width: `calc(${100 / 7}% - 16px)`,
                      top: `${booking.top + 8}px`,
                      height: `${Math.max(booking.height - 16, 64)}px`,
                      opacity: 0.95,
                      zIndex: 10,
                      boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
                    }}
                  >
                    {/* Left border bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-[8px] bg-[rgba(2,77,44,0.8)] rounded-l-[8px]" />
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col gap-[4px] pl-0 min-w-0">
                      <div className="text-[10px] font-semibold leading-tight truncate">
                        {booking.purpose || "Booking"}
                      </div>
                      <div className="text-[9px] text-white/90 leading-tight truncate">
                        {roomName}
                      </div>
                      <div className="text-[9px] text-white/80 leading-tight">
                        {timeLabel}
                      </div>
                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-[9px] text-white/80 leading-tight">
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
      </div>
    </div>
  );
}

