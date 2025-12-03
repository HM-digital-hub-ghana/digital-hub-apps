import { ASSETS } from "../../assets/assets";
import AdminRoomsBooking from "@web/components/AdminComponents/AdminRooms";
import { BookingForm } from "@web/components/BookingForm";
import RoomCard from "@web/components/room-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@web/components/ui/dialog";
import { useAuth } from "../../contexts/AuthContext";
import { apiGetRooms, type Room } from "../../service/bookings";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function RoomsBooking() {
  const { isAdmin } = useAuth(); //  access admin state from AuthContext

  //If admin, show AdminRoomsBooking instead
  if (isAdmin) {
    return <AdminRoomsBooking />;
  }

  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const data = await apiGetRooms();
        setRooms(data);
      } catch (error) {
        console.error("Failed to load rooms:", error);
        toast.error("Failed to load rooms. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const roomImages = useMemo(
    () => [ASSETS.conferenceRoomA, ASSETS.conferenceImage],
    []
  );

  const formatNextBookingTime = (value?: string | null) => {
    if (!value) {
      return "Not scheduled";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return format(date, "p");
  };

  const mapRoomToCardData = (
    room: Room,
    index: number
  ): {
    image: string;
    status: "available" | "occupied";
    conferenceRoomName: string;
    capacity: number;
    nextBookingTime: string;
    currentMeetingName?: string;
  } => {
    const status: "available" | "occupied" =
      room.availability_status?.toLowerCase() === "available"
        ? "available"
        : "occupied";

    return {
      image: roomImages[index % roomImages.length],
      status,
      conferenceRoomName: room.name,
      capacity: room.capacity ?? 0,
      nextBookingTime: formatNextBookingTime(room.next_booking_time),
      currentMeetingName: room.current_meeting_name ?? undefined,
    };
  };

  const handleBookRoom = (roomId: number) => {
    setSelectedRoomId(roomId);
    setIsBookingDialogOpen(true);
  };

  return (
    <div className="py-12">
      <h1 className="text-2xl font-semibold mb-6">Meeting Rooms</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">No rooms available.</p>
        </div>
      ) : (
        rooms.map((room, index) => (
          <RoomCard
            key={room.id}
            data={mapRoomToCardData(room, index)}
            canEdit={false}
            onBookRoom={() => handleBookRoom(room.id)}
          />
        ))
      )}

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-[500px] p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Make a Booking</DialogTitle>
          <DialogDescription className="sr-only">
            Fill out the form to book a meeting room
          </DialogDescription>
          <BookingForm
            roomId={selectedRoomId}
            onCancel={() => setIsBookingDialogOpen(false)}
            onSubmit={() => {
              setIsBookingDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
