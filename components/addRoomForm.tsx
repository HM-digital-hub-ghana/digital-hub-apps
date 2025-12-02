import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Upload, X, Plus, Trash2, Loader2 } from "lucide-react";
import { apiCreateRoom, type RoomAsset } from "@/service/bookings";
import toast from "react-hot-toast";

//asset schema
const assetSchema = z.object({
  name: z.string(),
  description: z.string(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
}).passthrough();

//schema to match API
const roomSchema = z.object({
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

type RoomFormValues = z.infer<typeof roomSchema>;

interface AddRoomFormProps {
  onClose: () => void;
}

export default function AddRoomForm({ onClose }: AddRoomFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      location: "",
      capacity: "",
      availability_status: "Available",
      assets: [],
    },
  });

  const assets = form.watch("assets") || [];

  const addAsset = () => {
    const currentAssets = form.getValues("assets") || [];
    form.setValue("assets", [
      ...currentAssets,
      { name: "", description: "", quantity: 1 },
    ]);
  };

  const removeAsset = (index: number) => {
    const currentAssets = form.getValues("assets") || [];
    form.setValue(
      "assets",
      currentAssets.filter((_, i) => i !== index)
    );
  };

  const updateAsset = (
    index: number,
    field: keyof RoomAsset,
    value: string | number
  ) => {
    const currentAssets = form.getValues("assets") || [];
    const updatedAssets = [...currentAssets];
    updatedAssets[index] = { ...updatedAssets[index], [field]: value };
    form.setValue("assets", updatedAssets, { shouldDirty: true, shouldValidate: false });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    //image upload - not done yet
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  const handleUploadAreaClick = () => fileInputRef.current?.click();
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    //image upload - not done
    const files = e.dataTransfer.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const onSubmit = async (values: RoomFormValues) => {
    try {
      setIsSubmitting(true);
      
      //filter out assets with empty names
      const validAssets = (values.assets || []).filter(
        (asset) => asset.name && asset.name.trim() && asset.description && asset.description.trim() && asset.quantity > 0
      );

      const payload: {
        name: string;
        location: string;
        capacity: number;
        availability_status: string;
        assets?: RoomAsset[];
      } = {
        name: values.name,
        location: values.location,
        capacity: Number(values.capacity),
        availability_status: values.availability_status,
      };

      //only include assets if there are valid ones
      if (validAssets.length > 0) {
        payload.assets = validAssets;
      }

      console.log("Submitting room payload:", payload);
      await apiCreateRoom(payload);
      toast.success("Room created successfully");
      onClose();
    } catch (error) {
      console.error("Failed to create room:", error);
      const errorMessage = 
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to create room";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const values = form.getValues();
    console.log("Form values before validation:", values);
    console.log("Assets in form:", values.assets);
    
    const isValid = await form.trigger();
    if (isValid) {
      await onSubmit(values);
    } else {
      const errors = form.formState.errors;
      console.log("Form validation errors:", errors);
      toast.error("Please fill in all required fields correctly");
    }
  };

  return (
    <Card className="w-full mx-auto border-0 flex flex-col max-h-[90vh]">
      <CardHeader className="flex-shrink-0 px-6 pt-6 pb-4">
        <CardTitle>Add New Room</CardTitle>
        <CardDescription>
          Create a new meeting room. Fill in the details below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto min-h-0 px-6">
        <Form {...form}>
          <form id="add-room-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Room Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Conference Room A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Floor 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability Status */}
            <FormField
              control={form.control}
              name="availability_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel>Assets (Optional)</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAsset}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Asset
                </Button>
              </div>
              {assets.map((asset, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded p-3 mb-2 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Asset {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAsset(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        type="text"
                        placeholder="Asset name"
                        value={asset.name}
                        onChange={(e) =>
                          updateAsset(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={asset.quantity}
                        onChange={(e) =>
                          updateAsset(index, "quantity", Number(e.target.value))
                        }
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="Description"
                      value={asset.description}
                      onChange={(e) =>
                        updateAsset(index, "description", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Image Upload - not working yet */}
            <div>
              <FormLabel>Room Images</FormLabel>
              <div className="space-y-4 mt-2">
                <div
                  role="button"
                  className="border-2 border-dashed rounded-md p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={handleUploadAreaClick}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop images here, or click to select <br />
                    <span className="text-xs">PNG, JPG up to 10MB</span>
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected Files:</p>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span className="text-sm truncate flex-1">
                          {file.name}
                        </span>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded-md mr-2"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <div className="flex-shrink-0 border-t px-6 py-4 bg-white">
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Room"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
