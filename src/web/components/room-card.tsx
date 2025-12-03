import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { routes } from "@web/conference-and-visitors-booking/constants/routes";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  Wifi,
  Monitor,
  Coffee,
  Video,
  Users,
  Clock,
  MapPin,
  Calendar,
  Dot,
  Pencil,
} from "lucide-react";

interface Card {
  image: string;
  status: "available" | "occupied";
  conferenceRoomName: string;
  capacity: number;
  nextBookingTime: string;
  currentMeetingName?: string;
}

interface CardProps {
  data: Card;
  onBookRoom?: () => void;
  canEdit?: boolean; // determines button mode
  onEditRoom?: () => void;
}

export default function RoomCard({
  data,
  onBookRoom,
  canEdit = false,
  onEditRoom,
}: CardProps) {
  const {
    image,
    status,
    conferenceRoomName,
    capacity,
    nextBookingTime,
    currentMeetingName,
  } = data;

  const amenities = [
    { name: "WiFi", icon: Wifi },
    { name: "TV Display", icon: Monitor },
    { name: "Coffee", icon: Coffee },
    { name: "Whiteboard", icon: Monitor },
    { name: "Video Conference", icon: Video },
  ];

  return (
    <div className="py-6">
      <div className="flex md:flex-row flex-col items-center md:gap-6">
        {/* Image and status badge */}
        <div className="relative w-full md:w-2/5">
          <img
            src={image}
            alt={conferenceRoomName}
            className="w-full object-cover"
          />

          <div className="absolute top-4 right-4">
            <Badge
              className={
                status === "available"
                  ? "bg-[#DCFCE7] text-[#008236]"
                  : "bg-[#FEE2E2] text-[#B91C1C]"
              }
            >
              {status === "available" ? "Available" : "Occupied"}
            </Badge>
          </div>

          <div className="absolute bottom-4 left-4">
            <Badge className="bg-[#00000066] p-2">
              <MapPin />
              335 Place <Dot /> Floor 9
            </Badge>
          </div>
        </div>

        {/* Right side content */}
        <div className="p-3 md:rounded-xl rounded-b-xl border border-gray-200 overflow-hidden bg-white shadow-[0_1px_2px_-1px_#0000001A]">
          <div className="py-3">
            <h3 className="text-xl font-semibold">{conferenceRoomName}</h3>
            <p className="flex text-muted-foreground/60">
              <Users className="w-5 h-5 text-sm text-muted-foreground/60" />
              <span className="px-2">Up to {capacity} people</span>
            </p>
          </div>

          {/* Availability */}
          <div
            className={`p-3 rounded-lg space-y-2 border ${
              status === "available"
                ? "bg-[#00DD390D] border-[#00DD3933]"
                : "bg-[#DC26260D] border-[#DC262633]"
            }`}
          >
            <p
              className={`font-bold ${
                status === "available" ? "text-[#00AB50]" : "text-[#E7000B]"
              }`}
            >
              {status === "available" ? "Available now" : "Currently occupied"}
            </p>

            {currentMeetingName && (
              <p className="font-bold">{currentMeetingName}</p>
            )}

            <p className="flex items-center">
              <Clock className="w-4 h-4" />
              <span className="px-1">Next booking at {nextBookingTime}</span>
            </p>
          </div>

          {/* Amenities */}
          <div>
            <p className="mt-3 font-bold">Amenities</p>
            <div className="flex flex-wrap gap-3 mt-2">
              {amenities.map(({ name, icon: Icon }) => (
                <div
                  key={name}
                  className="flex items-center py-2 px-6 bg-gray-100 rounded-lg gap-2 text-gray-700"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-xs">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="py-3">
            <Separator />
          </div>

          {/* Buttons */}
          <div className="py-4 flex gap-3">
            {canEdit ? (
              <Button variant="outline" className="flex-1" onClick={onEditRoom}>
                <Pencil className="mr-2" /> Edit
              </Button>
            ) : (
              <Link to={routes.dashboard} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Calendar className="mr-2" /> View Schedule
                </Button>
              </Link>
            )}

            <Button
              className="flex-1"
              disabled={status === "occupied"}
              onClick={onBookRoom}
            >
              Book Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
