import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Employee } from "@web/conference-and-visitors-booking/service/bookings";

interface AttendeeSelectorProps {
  selectedAttendees: Employee[];
  availableEmployees: Employee[];
  onAttendeesChange: (attendees: Employee[]) => void;
  placeholder?: string;
  className?: string;
}

export function AttendeeSelector({
  selectedAttendees,
  availableEmployees,
  onAttendeesChange,
  placeholder = "Type @ to search attendees...",
  className,
}: AttendeeSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  //filter employees(from search query)
  const filteredEmployees = availableEmployees.filter((emp) => {
    if (!searchQuery || !emp) return false;
    const query = searchQuery.toLowerCase();
    return (
      (emp.employee_name && emp.employee_name.toLowerCase().includes(query)) ||
      (emp.email && emp.email.toLowerCase().includes(query)) ||
      (emp.staff_id && emp.staff_id.toLowerCase().includes(query)) ||
      (emp.role && emp.role.toLowerCase().includes(query))
    );
  });

  //does input contain @
  useEffect(() => {
    const lastAt = inputValue.lastIndexOf("@");
    if (lastAt !== -1) {
      const query = inputValue.substring(lastAt + 1).trim();
      setSearchQuery(query);
      setShowDropdown(true);
    } else {
      setSearchQuery("");
      setShowDropdown(false);
    }
  }, [inputValue]);

  //close dropdown on outsude click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAttendee = (employee: Employee) => {
    //check if it has already been selected
    if (selectedAttendees.some((attendee) => attendee.id === employee.id)) {
      return;
    }

    onAttendeesChange([...selectedAttendees, employee]);
    
    // Clear input and close dropdown
    const lastAt = inputValue.lastIndexOf("@");
    if (lastAt !== -1) {
      setInputValue(inputValue.substring(0, lastAt));
    } else {
      setInputValue("");
    }
    setShowDropdown(false);
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleRemoveAttendee = (employeeId: number) => {
    onAttendeesChange(selectedAttendees.filter((attendee) => attendee.id !== employeeId));
  };

  const handleInputKeyDown = (input: React.KeyboardEvent<HTMLInputElement>) => {
    if (input.key === "Backspace" && inputValue === "" && selectedAttendees.length > 0) {
      //remove last attendee, when you bakcspace on empty input
      handleRemoveAttendee(selectedAttendees[selectedAttendees.length - 1].id);
    } else if (input.key === "ArrowDown" && showDropdown && filteredEmployees.length > 0) {
      input.preventDefault();
      //focus the first item
      const firstItem = containerRef.current?.querySelector(
        '[role="option"]'
      ) as HTMLElement;
      firstItem?.focus();
    } else if (input.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className="bg-[#f3f3f5] border-0 rounded-lg px-3 py-2 min-h-[36px] flex flex-wrap gap-2 items-center cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Selected attendees */}
        {selectedAttendees.map((attendee) => (
          <div
            key={attendee.id}
            className="bg-[#024d2c] text-white text-xs px-2 py-1 rounded flex items-center gap-1"
          >
            <span>{attendee.employee_name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveAttendee(attendee.id);
              }}
              className="hover:bg-white/20 rounded p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={selectedAttendees.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-sm placeholder:text-[#717182]"
        />
      </div>

      {/* Dropdown with search results */}
      {showDropdown && filteredEmployees.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredEmployees.map((employee) => {
            const isSelected = selectedAttendees.some((a) => a.id === employee.id);
            return (
              <div
                key={employee.id}
                role="option"
                tabIndex={0}
                onClick={() => handleSelectAttendee(employee)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectAttendee(employee);
                  }
                }}
                className={cn(
                  "px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between",
                  isSelected && "bg-gray-50 opacity-60"
                )}
              >
                <div>
                  <div className="font-medium text-sm">{employee.employee_name}</div>
                  <div className="text-xs text-gray-500">{employee.email}</div>
                  {employee.role && (
                    <div className="text-xs text-gray-400">{employee.role}</div>
                  )}
                  {employee.staff_id && (
                    <div className="text-xs text-gray-400">{employee.staff_id}</div>
                  )}
                </div>
                {isSelected && (
                  <span className="text-xs text-[#024d2c]">Selected</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {showDropdown && searchQuery && filteredEmployees.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-500">
          No employees found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}

