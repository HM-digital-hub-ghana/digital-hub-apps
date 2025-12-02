import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  apiGetUserNotifications,
  type NotificationsListResponse,
  type UserNotification,
} from "@/service/user";
import { handleApiError } from "@/lib/utils";

const NOTIFICATIONS_LIMIT = 5;

export default function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (currentOffset: number) => {
      try {
        setIsLoading(true);
        setError(null);
        const response: NotificationsListResponse =
          await apiGetUserNotifications({
            limit: NOTIFICATIONS_LIMIT,
            offset: currentOffset,
          });
        setNotifications(response.notifications ?? []);
        setTotal(response.total);
      } catch (err) {
        const message = handleApiError(
          err,
          "Failed to load notifications.",
          "NotificationsPopover.fetchNotifications"
        );
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      void fetchNotifications(offset);
    }
  }, [isOpen, offset, fetchNotifications]);

  const hasNotifications = (total ?? notifications.length) > 0;

  const canGoPrevious = offset > 0;
  const canGoNext = useMemo(() => {
    if (total !== undefined) {
      return offset + NOTIFICATIONS_LIMIT < total;
    }
    return notifications.length === NOTIFICATIONS_LIMIT;
  }, [offset, notifications.length, total]);

  const handlePrevious = () => {
    setOffset((current) => Math.max(0, current - NOTIFICATIONS_LIMIT));
  };

  const handleNext = () => {
    if (canGoNext) {
      setOffset((current) => current + NOTIFICATIONS_LIMIT);
    }
  };

  const displayRangeStart = offset + 1;
  const displayRangeEnd = offset + notifications.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-[14px]"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {hasNotifications && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[320px] p-0 overflow-hidden shadow-lg rounded-xl"
      >
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <p className="text-xs text-gray-500">
            Stay on top of your latest updates
          </p>
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : error ? (
            <div className="py-6 px-4 text-sm text-red-600">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="py-6 px-4 text-sm text-gray-500">
              You’re all caught up! No new notifications.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li key={notification.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title ||
                      notification.message ||
                      "Notification"}
                  </p>
                  {(notification.message || notification.description) && (
                    <p className="mt-1 text-xs text-gray-500">
                      {notification.message ?? notification.description}
                    </p>
                  )}
                  {notification.created_at && (
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {notifications.length > 0
              ? `${displayRangeStart}-${displayRangeEnd}${
                  total ? ` of ${total}` : ""
                }`
              : "0 notifications"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={!canGoPrevious || isLoading}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!canGoNext || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

