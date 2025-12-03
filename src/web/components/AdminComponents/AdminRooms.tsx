import { useState, useEffect } from "react";
import RoomCard from "@web/components/room-card";
import { ASSETS } from "../../conference-and-visitors-booking/assets/assets";
import { BookingForm } from "@web/components/BookingForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@web/components/ui/dialog";
import EditRoomForm from "../EditRoomForm";
import AddRoomForm from "../addRoomForm";
import { Plus } from "lucide-react";
import {
  apiGetAdminRooms,
  apiDeleteRoom,
  type AdminRoom,
} from "../../conference-and-visitors-booking/service/bookings";
import toast from "react-hot-toast";

export default function AdminRoomsBooking() {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookRoom = (roomId: number) => {
    setSelectedRoomId(roomId);
    setIsBookingDialogOpen(true);
  };

  const handleEditRoom = (roomId: number) => {
    setSelectedRoomId(roomId);
    setIsEditDialogOpen(true);
  };

  const handleAddRoom = () => {
    setIsAddDialogOpen(true);
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      await apiDeleteRoom(roomId);
      toast.success("Room deleted successfully");
      fetchRooms();
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast.error("Failed to delete room");
    }
  };

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const data = await apiGetAdminRooms();
      setRooms(data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast.error("Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const mapRoomToCardData = (room: AdminRoom) => {
    const status = room.availability_status.toLowerCase();
    return {
      image: ASSETS.conferenceRoomA,
      status: (status === "available" ? "available" : "occupied") as "available" | "occupied",
      conferenceRoomName: room.name,
      capacity: room.capacity,
      nextBookingTime: "2:00 PM",
    };
  };

  return (
    <div className="py-12">
      <h1 className="text-2xl font-semibold mb-6">Meeting Rooms</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      ) : (
        <>
          {/* Room cards */}
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              data={mapRoomToCardData(room)}
              canEdit
              onBookRoom={() => handleBookRoom(room.id)}
              onEditRoom={() => handleEditRoom(room.id)}
            />
          ))}
        </>
      )}

     {/* Add Room Button */}
<div className="bg-gray-200 py-12 text-center">
  <button
    onClick={handleAddRoom}
    className="flex flex-col items-center justify-center mx-auto space-y-2 focus:outline-none"
  >
    <div className="border-2 border-dashed border-gray-500 rounded-full p-3 hover:bg-gray-100 transition">
      <Plus className="h-8 w-8 text-gray-700" />
    </div>
    <span className="text-gray-800 font-medium">Add New Room</span>
  </button>
</div>


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
            onSubmit={() => setIsBookingDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[600px] p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Edit Room</DialogTitle>
          <DialogDescription className="sr-only">
            Update the room details
          </DialogDescription>
          <EditRoomForm
            roomId={selectedRoomId}
            onClose={() => {
              setIsEditDialogOpen(false);
              fetchRooms();
            }}
            onDelete={handleDeleteRoom}
          />
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-[600px] p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Add Room</DialogTitle>
          <DialogDescription className="sr-only">
            Add a new meeting room
          </DialogDescription>
          <AddRoomForm
            onClose={() => {
              setIsAddDialogOpen(false);
              fetchRooms();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
