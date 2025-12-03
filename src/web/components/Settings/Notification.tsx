import { Bell, Loader2, Mail, Smartphone } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  apiGetNotificationPreferences,
  apiUpdateNotificationPreferences,
  type NotificationPreferences,
  type UpdateNotificationPreferencesPayload,
} from "@web/conference-and-visitors-booking/service/user";
import { handleApiError } from "@/lib/utils";

type ToggleCategory = keyof NotificationPreferences;

type ToggleConfig = {
  id: string;
  title: string;
  detail: string;
  category: ToggleCategory;
  key: string;
};

const emailToggles: ToggleConfig[] = [
  {
    id: "email-booking-confirmations",
    title: "Booking Confirmations",
    detail: "Receive emails when bookings are confirmed",
    category: "email_notifications",
    key: "booking_confirmations",
  },
  {
    id: "email-booking-reminders",
    title: "Booking Reminders",
    detail: "Get reminded 15 minutes before meetings",
    category: "email_notifications",
    key: "booking_reminders",
  },
  {
    id: "email-visitor-arrival",
    title: "Visitor Arrival Alert",
    detail: "Notified when your visitor checks in",
    category: "email_notifications",
    key: "visitor_arrival_alert",
  },
  {
    id: "email-cancellation-notification",
    title: "Cancellation Notification",
    detail: "Receive alerts for booking cancellations",
    category: "email_notifications",
    key: "cancellation_notification",
  },
];

const pushToggles: ToggleConfig[] = [
  {
    id: "push-booking-updates",
    title: "Booking Updates",
    detail: "Real-time booking notifications",
    category: "push_notifications",
    key: "booking_updates",
  },
  {
    id: "push-visitor-alerts",
    title: "Visitor Alerts",
    detail: "Real-time visitor notifications",
    category: "push_notifications",
    key: "visitor_alerts",
  },
  {
    id: "push-meeting-reminders",
    title: "Meeting Reminders",
    detail: "Push reminders before meetings start",
    category: "push_notifications",
    key: "meeting_reminders",
  },
];

const activityToggles: ToggleConfig[] = [
  {
    id: "activity-daily-summary",
    title: "Daily Summary",
    detail: "Daily recap of bookings and visitors",
    category: "activity_notifications",
    key: "daily_summary",
  },
];

export default function Notification() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [draftPreferences, setDraftPreferences] =
    useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiGetNotificationPreferences();
      setPreferences(data);
      setDraftPreferences(clonePreferences(data));
    } catch (error) {
      const message = handleApiError(
        error,
        "Failed to load notification preferences.",
        "Notification.fetchPreferences"
      );
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggleChange = (config: ToggleConfig) => {
    setDraftPreferences((prev) => {
      if (!prev) {
        return prev;
      }

      const currentValue = getPreferenceValue(prev, config);
      const nextValue = !currentValue;

      return {
        ...prev,
        [config.category]: {
          ...prev[config.category],
          [config.key]: nextValue,
        },
      };
    });
  };

  const hasChanges = useMemo(() => {
    if (!preferences || !draftPreferences) {
      return false;
    }
    return !arePreferencesEqual(preferences, draftPreferences);
  }, [preferences, draftPreferences]);

  const handleSave = async () => {
    if (!draftPreferences) {
      return;
    }

    const payload: UpdateNotificationPreferencesPayload = {
      email_notifications: {
        ...draftPreferences.email_notifications,
      },
      push_notifications: {
        ...draftPreferences.push_notifications,
      },
      activity_notifications: {
        ...draftPreferences.activity_notifications,
      },
    };

    try {
      setIsSaving(true);
      await apiUpdateNotificationPreferences(payload);
      const snapshot = clonePreferences(draftPreferences);
      setPreferences(snapshot);
      setDraftPreferences(snapshot);
      toast.success("Notification preferences saved.");
    } catch (error) {
      const message = handleApiError(
        error,
        "Failed to save notification preferences.",
        "Notification.handleSave"
      );
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!preferences) {
      return;
    }
    setDraftPreferences(clonePreferences(preferences));
  };

  const emailItems = useMemo(() => emailToggles, []);
  const pushItems = useMemo(() => pushToggles, []);
  const activityItems = useMemo(() => activityToggles, []);

  if (isLoading || !preferences || !draftPreferences) {
    return (
      <div className="border border-[#E5E7EB] bg-white p-6 rounded-[8.75px]">
        <p className="text-sm text-[#717182]">
          Loading notification preferences...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-[16px]">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-[#4B5563] border border-[#E5E7EB] rounded-[6.75px] bg-white hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
          disabled={!hasChanges || isSaving}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-[6.75px] hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          disabled={!hasChanges || isSaving}
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </button>
      </div>

      <NotificationSection
        icon={<Mail className="w-[16.67px] h-[13.33px]" />}
        title="Email Notification"
        items={emailItems}
        preferences={draftPreferences}
        onToggle={handleToggleChange}
        disabled={isSaving}
      />

      <NotificationSection
        icon={<Smartphone className="w-[16.67px] h-[13.33px]" />}
        title="Push Notifications"
        items={pushItems}
        preferences={draftPreferences}
        onToggle={handleToggleChange}
        disabled={isSaving}
      />

      <NotificationSection
        icon={<Bell className="w-[16.67px] h-[13.33px]" />}
        title="Activity"
        items={activityItems}
        preferences={draftPreferences}
        onToggle={handleToggleChange}
        disabled={isSaving}
      />
    </div>
  );
}

type NotificationSectionProps = {
  icon: React.ReactNode;
  title: string;
  items: ToggleConfig[];
  preferences: NotificationPreferences;
  onToggle: (config: ToggleConfig) => void;
  disabled?: boolean;
};

function NotificationSection({
  icon,
  title,
  items,
  preferences,
  onToggle,
  disabled = false,
}: NotificationSectionProps) {
  return (
    <div className="border border-[#E5E7EB] bg-white rounded-[8.75px] p-[16px]">
      <div className="flex items-center mb-3 gap-2">
        {icon}
        <p className="text-[20px] ">{title}</p>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const active = getPreferenceValue(preferences, item);

          return (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-[8.75px] px-[14px] py-3 bg-[#F8FAFC] border border-[#E5E7EB]"
            >
              <div className="h-[62.58px] rounded-[1px] w-full md:w-[277.44px] flex justify-center flex-col">
                <h1>{item.title}</h1>
                <p className="text-[12px] text-[#717182]">{item.detail}</p>
              </div>
              <button
                type="button"
                onClick={() => onToggle(item)}
                className={`ml-4 w-[42px] h-[22px] rounded-full border border-transparent transition-colors flex items-center px-1 ${
                  active ? "bg-[#032E1B]" : "bg-[#CBCED4]"
                } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={disabled}
              >
                <span
                  className={`w-[18px] h-[18px] rounded-full bg-white transition-transform duration-200 ${
                    active ? "translate-x-[20px]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getPreferenceValue(
  preferences: NotificationPreferences,
  config: ToggleConfig
): boolean {
  const group = preferences[config.category] as Record<string, boolean>;
  return Boolean(group[config.key]);
}

function clonePreferences(
  prefs: NotificationPreferences
): NotificationPreferences {
  return {
    email_notifications: { ...prefs.email_notifications },
    push_notifications: { ...prefs.push_notifications },
    activity_notifications: { ...prefs.activity_notifications },
  };
}

function arePreferencesEqual(
  a: NotificationPreferences,
  b: NotificationPreferences
): boolean {
  return (
    a.email_notifications.booking_confirmations ===
      b.email_notifications.booking_confirmations &&
    a.email_notifications.booking_reminders ===
      b.email_notifications.booking_reminders &&
    a.email_notifications.visitor_arrival_alert ===
      b.email_notifications.visitor_arrival_alert &&
    a.email_notifications.cancellation_notification ===
      b.email_notifications.cancellation_notification &&
    a.push_notifications.booking_updates ===
      b.push_notifications.booking_updates &&
    a.push_notifications.visitor_alerts ===
      b.push_notifications.visitor_alerts &&
    a.push_notifications.meeting_reminders ===
      b.push_notifications.meeting_reminders &&
    a.activity_notifications.daily_summary ===
      b.activity_notifications.daily_summary
  );
}
