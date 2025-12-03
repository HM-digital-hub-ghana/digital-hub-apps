import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, XIcon, Ban } from "lucide-react";
import toast from "react-hot-toast";
import { apiCreateBooking, apiUpdateBooking, apiGetRooms, apiGetEmployees, apiCancelBooking, type Room, type Booking, type Employee } from "@web/conference-and-visitors-booking/service/bookings";
import { AttendeeSelector } from "./AttendeeSelector";

import { cn, formatDateTimeISO, handleApiError } from "@/lib/utils";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@web/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@web/components/ui/popover";
import { Calendar } from "@web/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@web/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@web/components/ui/form";

// Form validation schema
const bookingFormSchema = z.object({
  room: z.string().min(1, "Please select a room"),
  date: z.date({
    message: "Please pick a date",
  }),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time"),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time"),
  meetingTitle: z.string().min(1, "Please enter meeting title"),
  attendeeIds: z.array(z.number()),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  roomId?: number | null;
  booking?: Booking | null; // for editing booking
  initialDate?: Date | null; // Pre-fill date when clicking empty cell
  initialStartTime?: string | null; // Pre-fill start time when clicking empty cell
  onSubmit?: (data: BookingFormValues) => void;
  onCancel?: () => void;
  onBookingCancelled?: () => void; // Called when booking is successfully cancelled
  className?: string;
}

export function BookingForm({
  roomId,
  booking,
  initialDate,
  initialStartTime,
  onSubmit,
  onCancel,
  onBookingCancelled,
  className,
}: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [selectedAttendees, setSelectedAttendees] = useState<Employee[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const isEditMode = !!booking;

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      room: "",
      startTime: "",
      endTime: "",
      meetingTitle: "",
      attendeeIds: [],
    },
  });

  // Format time as HH:mm to match timeSlots format
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);
        const fetchedEmployees = await apiGetEmployees();
        setEmployees(fetchedEmployees);
      } catch (error) {
        console.error("Failed to load employees:", error);
        setEmployees([]);
      } finally {
        setEmployeesLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // populate form when booking is provided or initial values are set (after rooms and employees are loaded)
  useEffect(() => {
    if (booking && !roomsLoading && !employeesLoading && rooms.length > 0) {
      const startDate = new Date(booking.start_time);
      const endDate = new Date(booking.end_time);

      // Map booking attendees to Employee objects
      const bookingAttendees: Employee[] = booking.attendees
        ? booking.attendees.map((attendee) => ({
            id: attendee.id,
            staff_id: attendee.staff_id,
            employee_name: attendee.employee_name,
            email: attendee.email,
            role: undefined,
          }))
        : [];

      setSelectedAttendees(bookingAttendees);

      form.reset({
        room: booking.room_id.toString(),
        date: startDate,
        startTime: formatTime(startDate),
        endTime: formatTime(endDate),
        meetingTitle: booking.purpose,
        attendeeIds: bookingAttendees.map((attendee) => attendee.id),
      });
    } else if ((initialDate || initialStartTime) && !roomsLoading) {
      // pre fill date and time when clicking an empty cell
      const date = initialDate || new Date();
      const startTime = initialStartTime || formatTime(new Date());
      
      //calculate the end time(defaul to 1 hour later)
      const [hours, minutes] = startTime.split(':').map(Number);
      const endTimeDate = new Date(date);
      endTimeDate.setHours(hours + 1, minutes, 0, 0);
      const endTime = formatTime(endTimeDate);

      setSelectedAttendees([]);

      form.reset({
        room: roomId?.toString() || "",
        date: date,
        startTime: startTime,
        endTime: endTime,
        meetingTitle: "",
        attendeeIds: [],
      });
    } else if (roomId != null && !roomsLoading) {
      form.setValue("room", roomId.toString());
    }
  }, [booking, initialDate, initialStartTime, roomId, form, roomsLoading, employeesLoading, rooms]);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setRoomsLoading(true);
        const fetchedRooms = await apiGetRooms();
        const uniqueRooms = Array.from(
          new Map(fetchedRooms.map((room) => [room.id, room])).values()
        );
        setRooms(uniqueRooms);
      } catch (error) {
        const errorMessage = handleApiError(
          error,
          "Failed to load rooms. Please try again.",
          "BookingForm.fetchRooms"
        );
        toast.error(errorMessage);
        setRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Sync selectedAttendees with form attendeeIds
  useEffect(() => {
    form.setValue("attendeeIds", selectedAttendees.map((a) => a.id));
  }, [selectedAttendees, form]);

  const handleSubmitForm = async (data: BookingFormValues) => {
    setIsLoading(true);
    try {
      const roomIdNum = parseInt(data.room);
      if (!roomIdNum || isNaN(roomIdNum)) {
        toast.error("Invalid room selected");
        setIsLoading(false);
        return;
      }

      const startDateTime = formatDateTimeISO(data.date, data.startTime);
      const endDateTime = formatDateTimeISO(data.date, data.endTime);

      const payload = {
        room_id: roomIdNum,
        start_time: startDateTime,
        end_time: endDateTime,
        purpose: data.meetingTitle,
        attendee_ids: data.attendeeIds.length > 0 ? data.attendeeIds : undefined,
      };

      if (isEditMode && booking) {
        await apiUpdateBooking(booking.id, payload);
        toast.success("Booking updated successfully!");
      } else {
        await apiCreateBooking(payload);
        toast.success("Booking created successfully!");
      }

      form.reset();
      setSelectedAttendees([]);
      onSubmit?.(data);
    } catch (error) {
      const errorMessage = handleApiError(
        error,
        isEditMode 
          ? "Failed to update booking. Please try again."
          : "Failed to create booking. Please try again.",
        "BookingForm.handleSubmit"
      );
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      setShowCancelConfirm(true);
    } else {
      form.reset();
      onCancel?.();
    }
  };

  const handleConfirmCancel = async () => {
    if (isEditMode && booking) {
      try {
        setIsCancelling(true);
        await apiCancelBooking(booking.id);
        toast.success("Booking cancelled successfully");
        form.reset();
        setShowCancelConfirm(false);
        onBookingCancelled?.(); // Notify parent to refresh bookings
        onCancel?.(); // Close the dialog
      } catch (error) {
        const errorMessage = handleApiError(
          error,
          "Failed to cancel booking. Please try again.",
          "BookingForm.handleConfirmCancel"
        );
        toast.error(errorMessage);
      } finally {
        setIsCancelling(false);
      }
    } else {
      form.reset();
      setShowCancelConfirm(false);
      onCancel?.();
    }
  };

  return (
    <div
      className={cn(
        "bg-white relative w-full max-w-[500px]",
        className
      )}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute top-4 right-4 opacity-70 hover:opacity-100 rounded-sm"
        onClick={() => {
          form.reset();
          onCancel?.();
        }}
      >
        <XIcon className="size-4" />
        <span className="sr-only">Close</span>
      </Button>

      {/* Header */}
      <div className="px-6 pt-6 pb-[32px]">
        <h2 className="text-lg font-semibold text-neutral-950 leading-[18px]">
          {isEditMode ? "Update Booking" : "Make a Booking"}
        </h2>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmitForm)}
          className="px-6 pb-6 space-y-6"
        >
          {/* Room Selection */}
          <FormField
            control={form.control}
            name="room"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-950">
                  Room
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      disabled={roomsLoading}
                      className="bg-[#F3F3F5] border-[0.667px] rounded-[8px] h-[36px] text-sm w-full px-3"
                    >
                      <SelectValue
                        placeholder={
                          roomsLoading ? "Loading rooms..." : "Select a room"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rooms.length > 0 ? (
                      rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-rooms" disabled>
                        {roomsLoading ? "Loading..." : "No rooms available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Selection */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-950">
                  Date
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-9 bg-white border-black/10 border-[0.667px] rounded-lg px-3 text-sm",
                          !field.value && "text-[10,10,10,1]"
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span className="text-neutral-950 font-medium">
                            Pick a date
                          </span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-950">
                    Start Time
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      step="60"
                      className="bg-[#F3F3F5] border-0 rounded-[8px] h-[36px] text-sm w-full px-3 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-950">
                    End Time
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      step="60"
                      className="bg-[#F3F3F5] border-0 rounded-[8px] h-[36px] text-sm w-full px-3 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Meeting Title */}
          <FormField
            control={form.control}
            name="meetingTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-950">
                  Meeting Title
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter meeting title"
                    className="bg-[#f3f3f5] border-0 h-9 rounded-lg px-3 text-sm placeholder:text-[#717182]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Attendees */}
          <FormField
            control={form.control}
            name="attendeeIds"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-950">
                  Attendees
                </FormLabel>
                <FormControl>
                  <AttendeeSelector
                    selectedAttendees={selectedAttendees}
                    availableEmployees={employees}
                    onAttendeesChange={setSelectedAttendees}
                    placeholder="Type @ to search attendees..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className={cn(
                "h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-1",
                isEditMode
                  ? "bg-white border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  : "bg-white border-black/10 border-[0.667px] text-neutral-950"
              )}
            >
              {isEditMode && <Ban className="w-4 h-4" />}
              {isEditMode ? "Cancel Booking" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-9 px-6 bg-[#024d2c] hover:bg-[#024d2c]/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (isEditMode ? "Updating..." : "Creating...") 
                : (isEditMode ? "Update Booking" : "Confirm Booking")}
            </Button>
          </div>
        </form>
      </Form>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              className="h-9 px-4"
            >
              No, Keep Booking
            </Button>
            <Button
              type="button"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
