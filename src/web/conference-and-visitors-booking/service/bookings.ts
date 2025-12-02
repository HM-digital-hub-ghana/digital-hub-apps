import { apiClient } from "./axios-config";

export interface CreateBookingPayload {
  room_id: number;
  start_time: string;
  end_time: string;
  purpose: string;
  attendee_ids?: number[];
}

export interface CreateBookingRequest {
  room: string;
  date: Date;
  startTime: string;
  endTime: string;
  meetingTitle: string;
  attendees: number;
}

export interface Attendee {
  id: number;
  staff_id: string;
  employee_name: string;
  email: string;
}

export interface Booking {
  id: number;
  room_id: number;
  user_id: number;
  purpose: string;
  status: string;
  start_time: string;
  end_time: string;
  cancelled_by_admin: boolean;
  created_at: string;
  room_name?: string;
  attendees?: Attendee[];//attendee objs
}

export interface Room {
  id: number;
  name: string;
  location?: string | null;
  capacity?: number | null;
  availability_status?: string | null;
  next_booking_time?: string | null;
  current_meeting_name?: string | null;
  assets?: RoomAsset[];
}

export const apiCreateBooking = async (payload: CreateBookingPayload) => {
  return apiClient.post("booking/create", payload);
};

export const apiGetRooms = async (): Promise<Room[]> => {
  try {
    const response = await apiClient.get("booking/rooms");
    const data = response.data;

    if (Array.isArray(data)) {
      return data as Room[];
    }

    if (data?.rooms && Array.isArray(data.rooms)) {
      return data.rooms as Room[];
    }

    console.error("Unexpected response format:", data);
    return [];
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return [];
  }
};

type FetchBookingsParams = {
  start?: string;
  end?: string;
  status?: string;
};

export const apiGetAllBookings = async (
  params: FetchBookingsParams = {}
): Promise<Booking[]> => {
  try {
    const response = await apiClient.get("booking/all_bookings", {
      params,
    });
    if (
      typeof response.data === "string" ||
      response.data?.bookings === undefined
    ) {
      console.error("Unexpected response format:", response.data);
      return [];
    }
    return response.data.bookings as Booking[];
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
};

export const apiGetMyBookings = async (
  params: FetchBookingsParams = {}
): Promise<Booking[]> => {
  try {
    const response = await apiClient.get("booking/my-bookings", {
      params,
    });
    if (
      typeof response.data === "string" ||
      response.data?.bookings === undefined
    ) {
      console.error("Unexpected response format:", response.data);
      return [];
    }
    return response.data.bookings as Booking[];
  } catch (error) {
    console.error("Failed to fetch my bookings:", error);
    return [];
  }
};

export const apiUpdateBooking = async (
  bookingId: number,
  payload: CreateBookingPayload
) => {
  return apiClient.put(`booking/${bookingId}/update`, payload);
};

export const apiCancelBooking = async (bookingId: number) => {
  return apiClient.delete(`booking/${bookingId}/cancel`);
};

export interface Employee {
  id: number;
  employee_name: string;
  email: string;
  role?: string;
  staff_id?: string;
}

export const apiGetEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await apiClient.get("admin/users");
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.users && Array.isArray(response.data.users)) {
      return response.data.users;
    }
    if (response.data?.employees && Array.isArray(response.data.employees)) {
      return response.data.employees;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
};

// Admin Room Management Interfaces and APIs
export interface RoomAsset {
  name: string;
  description: string;
  quantity: number;
}

export interface AdminRoom {
  id: number;
  name: string;
  location: string;
  capacity: number;
  availability_status: string;
  assets?: RoomAsset[];
}

export interface CreateRoomPayload {
  name: string;
  location: string;
  capacity: number;
  availability_status: string;
  assets?: RoomAsset[];
}

export type UpdateRoomPayload = CreateRoomPayload;

export const apiGetAdminRooms = async (): Promise<AdminRoom[]> => {
  try {
    const response = await apiClient.get("admin/rooms");
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.rooms && Array.isArray(response.data.rooms)) {
      return response.data.rooms;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch admin rooms:", error);
    return [];
  }
};

export const apiCreateRoom = async (payload: CreateRoomPayload) => {
  return apiClient.post("admin/rooms/create", payload);
};

export const apiUpdateRoom = async (
  roomId: number,
  payload: UpdateRoomPayload
) => {
  return apiClient.put(`rooms/${roomId}/update`, payload);
};

export const apiDeleteRoom = async (roomId: number) => {
  return apiClient.delete(`rooms/${roomId}/delete`);
};

