import { Check, ChevronDown } from "lucide-react";
import  { useState, useEffect, useRef } from "react";

interface DWMchangesProps {
  onViewChange?: (view: 'day' | 'week' | 'month') => void;
  currentView?: 'day' | 'week' | 'month';
}

export default function DWMchanges({ onViewChange, currentView = 'day' }: DWMchangesProps) {
  const [change, setchange] = useState(false);
  const [dayChecked, setdayChecked] = useState(currentView === 'day');
  const [weekChecked, setweekChecked] = useState(currentView === 'week');
  const [monthChecked, setmonthChecked] = useState(currentView === 'month');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setdayChecked(currentView === 'day');
    setweekChecked(currentView === 'week');
    setmonthChecked(currentView === 'month');
  }, [currentView]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setchange(false);
      }
    };

    if (change) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [change]);
  const daysWeekMonth = [
    {
      id: 1,
      text: "Day",
      icon: <Check className="w-[8.5px]" />,
    },
    {
      id: 2,
      text: "Week",
      icon: <Check className="w-[8.5px]" />,
    },
    {
      id: 3,
      text: "Month",
      icon: <Check className="w-[8.5px]" />,
    },
  ];
  function ifClicked(e: number) {
    setchange(false);
    if (e == 1) {
      setdayChecked(true);
      setweekChecked(false);
      setmonthChecked(false);
      onViewChange?.('day');
    } else if (e == 2) {
      setdayChecked(false);
      setweekChecked(true);
      setmonthChecked(false);
      onViewChange?.('week');
    } else if (e == 3) {
      setdayChecked(false);
      setweekChecked(false);
      setmonthChecked(true);
      onViewChange?.('month');
    }
  }
  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`border border-gray-200 w-20 h-[43px] flex items-center justify-between ${
          change ? "rounded-t-xl" : "rounded-xl"
        } text-[14px] px-2 shadow bg-white cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation();
          setchange(!change);
        }}
      >
        <div className="flex-1 text-center">
          {dayChecked
            ? "Day"
            : weekChecked
            ? "Week"
            : monthChecked
            ? "Month"
            : "Day"}
        </div>
        <ChevronDown className={`w-[7px] transition-transform ${change ? "rotate-180" : ""}`} />
      </div>
      {change && (
        <div className="absolute top-full left-0 w-20 z-50 shadow-lg border border-gray-200 border-t-0 rounded-b-xl bg-white overflow-hidden">
          {daysWeekMonth.map((each) => {
            return (
              <div
                key={each.id}
                onClick={(e) => {
                  e.stopPropagation();
                  ifClicked(each.id);
                }}
                className="flex items-center justify-between hover:bg-gray-100 cursor-pointer px-2 py-1.5 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-sm">{each.text}</span>
                {(dayChecked && each.id == 1) ||
                (weekChecked && each.id == 2) ||
                (monthChecked && each.id == 3) ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
