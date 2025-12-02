import { Funnel, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
 
export interface FilterState {
  status: string | null;
  date: Date | null;
}

interface AdminFilterProps {
  onFilterChange?: (filters: FilterState) => void;
  isListView: boolean;
}

export default function AdminFilter({ onFilterChange, isListView }: AdminFilterProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Reset filters when switching away from list view
  useEffect(() => {
    if (!isListView) {
      setStatus(null);
      setDate(null);
      setIsOpen(false);
    }
  }, [isListView]);

  const handleStatusChange = (value: string) => {
    const newStatus = value === "all" ? null : value;
    setStatus(newStatus);
    onFilterChange?.({ status: newStatus, date });
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    const newDate = selectedDate || null;
    setDate(newDate);
    onFilterChange?.({ status, date: newDate });
  };

  const handleClearFilters = () => {
    setStatus(null);
    setDate(null);
    onFilterChange?.({ status: null, date: null });
  };

  const hasActiveFilters = status !== null || date !== null;

  if (!isListView) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex items-center gap-[4px] border bg-white border-gray-200 rounded-[8px] w-[81px] h-[43px] justify-center text-sm',
            hasActiveFilters && 'border-primary bg-primary/5'
          )}
        >
          <Funnel className='w-[13px]'/>
          <span>Filter</span>
          {hasActiveFilters && (
            <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Filter Bookings</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status || "all"} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 bg-white",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date || undefined}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
