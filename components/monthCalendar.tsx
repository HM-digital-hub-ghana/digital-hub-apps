import { useMemo, useState } from "react";
import type { Booking } from "@/service/bookings";

const BORDER_COLOR = "rgba(171, 171, 171, 1)";
const BORDER_STYLE = `0.67px solid ${BORDER_COLOR}`;

type MonthCalendarProps = {
  bookings?: Booking[];
  onCellClick?: (date: Date, hour: number) => void;
  currentDate?: Date;
};

export default function MonthCalendar({ 
  bookings = [], 
  onCellClick,
  currentDate = new Date()
}: MonthCalendarProps) {
  const [cell, setCell] = useState(Array(49).fill(""));
  function ClickOnMonth(index: number) {
    const newCell = [...cell];
    newCell[index] = prompt("What booking are you making this month");
    setCell(newCell);
  }
  const days = [
    { id: 1, text: "Mon", day: 16 },
    { id: 2, text: "Tue", day: 17 },
    { id: 3, text: "Wed", day: 18 },
    { id: 4, text: "Thu", day: 19 },
    { id: 5, text: "Fri", day: 20 },
    { id: 6, text: "Sat", day: 21 },
    { id: 7, text: "Sun", day: 22 },
  ];
  const bookingsByDayKey = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      const d = new Date(b.start_time);
      const key = d.toDateString();
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [bookings]);
  return (
    <div
      className="h-full w-full flex flex-col rounded-[10px] overflow-hidden"
      style={{ border: BORDER_STYLE }}
    >
      {/* Months */}
      <div
        className="h-[56px] grid grid-cols-7 flex-shrink-0"
        style={{ borderBottom: BORDER_STYLE }}
      >
          {days.map((each) => {
            return (
              <div
                key={each.id}
                className="flex justify-center items-center"
                style={{ borderLeft: each.id === 1 ? undefined : BORDER_STYLE }}
              >
                <div>{each.text}</div>
              </div>
            );
          })}
        </div>

      <div className="flex-1 grid grid-cols-7 font-[600] overflow-auto">
          <div className="col-span-7 grid grid-cols-7">
            {cell.map((value, index) => {
              const columnIndex = index % 7;
              const rowIndex = Math.floor(index / 7);
              
              const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              const firstDayOfWeek = firstDayOfMonth.getDay();
              const mondayOffset = (firstDayOfWeek + 6) % 7;
              const calendarStart = new Date(firstDayOfMonth);
              calendarStart.setDate(firstDayOfMonth.getDate() - mondayOffset);
              calendarStart.setHours(0, 0, 0, 0);
              
              const dateForCell = new Date(calendarStart);
              dateForCell.setDate(calendarStart.getDate() + (rowIndex * 7) + columnIndex);
              
              const count = bookingsByDayKey.get(dateForCell.toDateString()) || 0;
              const defaultHour = 9;
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (onCellClick) {
                      const cellDate = new Date(dateForCell);
                      cellDate.setHours(defaultHour, 0, 0, 0);
                      onCellClick(cellDate, defaultHour);
                    } else {
                      ClickOnMonth(index);
                    }
                  }}
                  className="flex flex-col cursor-pointer hover:bg-gray-100"
                  style={{
                    borderLeft: columnIndex === 0 ? undefined : BORDER_STYLE,
                    borderTop: rowIndex === 0 ? undefined : BORDER_STYLE,
                    borderBottom: BORDER_STYLE,
                  }}
                >
                  <div className="flex items-center justify-between p-1">
                    <span className="text-[12px] text-[#717182]">{dateForCell.getDate()}</span>
                    {count > 0 && (
                      <span className="text-[10px] bg-[#024d2c] text-white rounded-full px-2 py-[2px]">
                        {count}
                      </span>
                    )}
                  </div>
                 {
                
                    <div className={`border-l-5 border-primary text-[10px] bg-[#13a56661] ${value?"h-full":""} flex items-end rounded-r-[6px] m-1 `}>
                    {value}
                    </div>
                 } 
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
}
