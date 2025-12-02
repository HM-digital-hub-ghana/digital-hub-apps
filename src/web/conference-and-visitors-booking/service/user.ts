import { apiClient } from "./axios-config";

export interface UserProfile {
  id: number;
  staff_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string | null;
  phone?: string | null;
}

export interface UpdateUserProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string | null;
}

export interface UpdateUserProfileResponse {
  message: string;
  user: UserProfile;
}

export const apiGetUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>("user/profile");
  return response.data;
};

export const apiUpdateUserProfile = async (
  payload: UpdateUserProfilePayload
): Promise<UpdateUserProfileResponse> => {
  const response = await apiClient.put<UpdateUserProfileResponse>(
    "user/profile",
    payload
  );
  return response.data;
};

export interface UploadAvatarResponse {
  message: string;
  avatar_url: string;
}

export const apiUploadAvatar = async (
  file: File
): Promise<UploadAvatarResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<UploadAvatarResponse>(
    "user/profile/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const apiDeleteAvatar = async (): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    "user/profile/avatar"
  );
  return response.data;
};

export interface NotificationPreferences {
  email_notifications: {
    booking_confirmations: boolean;
    booking_reminders: boolean;
    visitor_arrival_alert: boolean;
    cancellation_notification: boolean;
  };
  push_notifications: {
    booking_updates: boolean;
    visitor_alerts: boolean;
    meeting_reminders: boolean;
  };
  activity_notifications: {
    daily_summary: boolean;
  };
}

export interface UpdateNotificationPreferencesPayload {
  email_notifications?: Partial<
    NotificationPreferences["email_notifications"]
  >;
  push_notifications?: Partial<NotificationPreferences["push_notifications"]>;
  activity_notifications?: Partial<
    NotificationPreferences["activity_notifications"]
  >;
}

export interface UpdateNotificationPreferencesResponse {
  message: string;
  preferences: NotificationPreferences;
}

export const apiGetNotificationPreferences =
  async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<NotificationPreferences>(
      "user/notifications"
    );
    return response.data;
  };

export const apiUpdateNotificationPreferences = async (
  payload: UpdateNotificationPreferencesPayload
): Promise<UpdateNotificationPreferencesResponse> => {
  const response = await apiClient.put<UpdateNotificationPreferencesResponse>(
    "user/notifications",
    payload
  );
  return response.data;
};

export interface UserNotification {
  id: number;
  title?: string;
  message?: string;
  description?: string;
  created_at?: string;
  is_read?: boolean;
  [key: string]: unknown;
}

export interface NotificationsListResponse {
  total?: number;
  notifications: UserNotification[];
}

export const apiGetUserNotifications = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<NotificationsListResponse> => {
  const response = await apiClient.get<NotificationsListResponse>(
    "user/notifications/list",
    {
      params,
    }
  );
  return response.data;
};

