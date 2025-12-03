import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Trash2, Plus } from "lucide-react";
import {
  apiGetAdminRooms,
  apiUpdateRoom,
  apiDeleteRoom,
  type RoomAsset,
} from "@web/conference-and-visitors-booking/service/bookings";
import toast from "react-hot-toast";

// Validation schema
const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const formSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  location: z.string().min(1, "Location is required"),
  capacity: z
    .string()
    .min(1, "Capacity is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Capacity must be a positive number",
    }),
  availability_status: z.string().min(1, "Status is required"),
  assets: z.array(assetSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

//props interface
interface EditRoomFormProps {
  roomId: number | null;
  onClose: () => void;
  onDelete?: (roomId: number) => void;
}

export default function EditRoomForm({
  roomId,
  onClose,
  onDelete,
}: EditRoomFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      capacity: "",
      availability_status: "Available",
      assets: [],
    },
  });

  const assets = watch("assets") || [];

  //oad existing room data
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;

      try {
        setIsLoading(true);
        const rooms = await apiGetAdminRooms();
        const room = rooms.find((r) => r.id === roomId);

        if (room) {
          setValue("name", room.name);
          setValue("location", room.location);
          setValue("capacity", room.capacity.toString());
          setValue("availability_status", room.availability_status);
          setValue("assets", room.assets || []);
        }
      } catch (error) {
        console.error("Failed to fetch room data:", error);
        toast.error("Failed to load room data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, setValue]);

  const onSubmit = async (data: FormValues) => {
    if (!roomId) return;

    try {
      setIsLoading(true);
      await apiUpdateRoom(roomId, {
        name: data.name,
        location: data.location,
        capacity: Number(data.capacity),
        availability_status: data.availability_status,
        assets: data.assets || [],
      });
      toast.success("Room updated successfully");
      onClose();
    } catch (error) {
      console.error("Failed to update room:", error);
      toast.error("Failed to update room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!roomId || !onDelete) return;

    if (!confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await apiDeleteRoom(roomId);
      toast.success("Room deleted successfully");
      onDelete(roomId);
      onClose();
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast.error("Failed to delete room");
    } finally {
      setIsDeleting(false);
    }
  };

  const addAsset = () => {
    const currentAssets = watch("assets") || [];
    setValue("assets", [
      ...currentAssets,
      { name: "", description: "", quantity: 1 },
    ]);
  };

  const removeAsset = (index: number) => {
    const currentAssets = watch("assets") || [];
    setValue(
      "assets",
      currentAssets.filter((_, i) => i !== index)
    );
  };

  const updateAsset = (
    index: number,
    field: keyof RoomAsset,
    value: string | number
  ) => {
    const currentAssets = watch("assets") || [];
    const updatedAssets = [...currentAssets];
    updatedAssets[index] = { ...updatedAssets[index], [field]: value };
    setValue("assets", updatedAssets);
  };

  if (isLoading && !roomId) {
    return (
      <div className="max-h-[80vh] overflow-y-auto flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
          <p className="text-gray-600">Loading room data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 flex flex-col relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 py-3 sticky top-0 bg-white z-10">
          <div>
            <h1 className="text-gray-900 text-xl font-semibold mb-1">
              Edit Room {roomId ? `#${roomId}` : ""}
            </h1>
            <p className="text-gray-600 text-sm">
              Update your meeting room details below.
            </p>
          </div>
          <button
            className="text-gray-400 p-3 hover:bg-gray-100"
            onClick={onClose} //close dialog
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-gray-700 mb-1">Room Name</label>
            <input
              {...register("name")}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              placeholder="Enter room name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-gray-700 mb-1">Location</label>
            <input
              {...register("location")}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              placeholder="e.g., Floor 2"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-gray-700 mb-1">Capacity</label>
            <input
              {...register("capacity")}
              type="number"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              placeholder="Enter capacity"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.capacity.message}
              </p>
            )}
          </div>

          {/* Availability Status */}
          <div>
            <label className="block text-gray-700 mb-1">Availability Status</label>
            <select
              {...register("availability_status")}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Reserved">Reserved</option>
            </select>
            {errors.availability_status && (
              <p className="text-red-500 text-sm mt-1">
                {errors.availability_status.message}
              </p>
            )}
          </div>

          {/* Assets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700">Assets (Optional)</label>
              <button
                type="button"
                onClick={addAsset}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                Add Asset
              </button>
            </div>
            {assets.map((asset, index) => (
              <div key={index} className="border border-gray-200 rounded p-3 mb-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Asset {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeAsset(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Asset name"
                      value={asset.name}
                      onChange={(e) => updateAsset(index, "name", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={asset.quantity}
                      onChange={(e) => updateAsset(index, "quantity", Number(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Description"
                    value={asset.description}
                    onChange={(e) => updateAsset(index, "description", e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-3">
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Room"}
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Update Room"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
