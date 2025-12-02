import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date and time string into ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
 * without timezone conversion, using local time.
 *
 * @param date - The date object
 * @param timeString - Time string in format "HH:mm" (24-hour format)
 * @returns ISO formatted string like "2025-10-25T20:37:00"
 */
export function formatDateTimeISO(date: Date, timeString: string): string {
  const [hours, minutes] = timeString.split(":").map(Number);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(hours).padStart(2, "0");
  const minute = String(minutes).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:00`;
}

/**
 * Extracts error message from axios error response
 * Handles various response structures from the backend
 *
 * @param error - The error object from axios
 * @param defaultMessage - Default message if no error message is found
 * @returns The error message string
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage: string = "An error occurred"
): string {
  const axiosError = error as {
    response?: {
      data?: unknown;
      status?: number;
      statusText?: string;
    };
    message?: string;
  };

  // If response data exists, try to extract message
  if (axiosError?.response?.data) {
    const data = axiosError.response.data;

    // Handle case where data is a string
    if (typeof data === "string") {
      return makeUserFriendly(data);
    }

    // Handle case where data is an object
    if (typeof data === "object" && data !== null) {
      const dataObj = data as Record<string, unknown>;

      // Check common error message fields
      if (typeof dataObj.message === "string" && dataObj.message) {
        return makeUserFriendly(dataObj.message);
      }

      if (typeof dataObj.msg === "string" && dataObj.msg) {
        return makeUserFriendly(dataObj.msg);
      }

      if (typeof dataObj.error === "string" && dataObj.error) {
        return makeUserFriendly(dataObj.error);
      }

      if (typeof dataObj.detail === "string" && dataObj.detail) {
        return makeUserFriendly(dataObj.detail);
      }

      // Handle validation errors object
      if (dataObj.errors && typeof dataObj.errors === "object") {
        const errors = dataObj.errors as Record<string, unknown>;
        const errorMessages: string[] = [];

        Object.values(errors).forEach((errorValue) => {
          if (Array.isArray(errorValue)) {
            errorValue.forEach((msg) => {
              if (typeof msg === "string") {
                errorMessages.push(msg);
              }
            });
          } else if (typeof errorValue === "string") {
            errorMessages.push(errorValue);
          }
        });

        if (errorMessages.length > 0) {
          return errorMessages.map((msg) => makeUserFriendly(msg)).join(", ");
        }
      }

      // Try to stringify the entire data object as last resort
      try {
        const stringified = JSON.stringify(data);
        if (stringified && stringified !== "{}") {
          return makeUserFriendly(stringified);
        }
      } catch {
        // Ignore JSON stringify errors
      }
    }
  }

  // Fallback to axios error message
  if (axiosError?.message) {
    return makeUserFriendly(axiosError.message);
  }

  return defaultMessage;
}

/**
 * Converts technical error messages to user-friendly messages
 *
 * @param message - The technical error message
 * @returns User-friendly error message
 */
function makeUserFriendly(message: string): string {
  // First, replace underscores with spaces
  let friendly = message.replace(/_/g, " ");

  // Common field name replacements (multi-word fields first to avoid partial matches)
  const fieldReplacements: Record<string, string> = {
    "purpose of visit": "Purpose of visit",
    "start time": "Start time",
    "end time": "End time",
    "scheduled date": "Scheduled date",
    "visit date": "Visit date",
    "visit time": "Visit time",
    "meeting title": "Meeting title",
    "purpose type": "Purpose type",
    "staff id": "Staff ID",
    "room id": "Room ID",
    "visitor id": "Visitor ID",
  };

  // Apply field replacements (case-insensitive, word boundaries)
  Object.entries(fieldReplacements).forEach(([key, replacement]) => {
    const regex = new RegExp(`\\b${key.replace(/\s+/g, "\\s+")}\\b`, "gi");
    friendly = friendly.replace(regex, replacement);
  });

  // Split into words and capitalize remaining words
  const words = friendly.split(/(\s+)/);
  friendly = words
    .map((word) => {
      // Skip whitespace
      if (/^\s+$/.test(word)) {
        return word;
      }

      // If word is already capitalized (part of a replacement), keep it
      if (word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 0) {
        // Check if it's a known replacement word
        const isKnownField = Object.values(fieldReplacements).some((v) =>
          v.split(/\s+/).includes(word)
        );
        if (isKnownField) {
          return word;
        }
      }

      // Capitalize first letter, lowercase rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");

  return friendly;
}

/**
 * Logs error with status code and message for debugging
 *
 * @param error - The error object from axios
 * @param context - Additional context about where the error occurred
 */
export function logApiError(error: unknown, context?: string): void {
  const axiosError = error as {
    response?: {
      data?: unknown;
      status?: number;
      statusText?: string;
    };
    message?: string;
    config?: {
      method?: string;
      url?: string;
    };
  };

  const status = axiosError?.response?.status;
  const statusText = axiosError?.response?.statusText;
  const message = extractErrorMessage(error);
  const method = axiosError?.config?.method?.toUpperCase();
  const url = axiosError?.config?.url;

  const logContext = context ? `[${context}]` : "";
  const requestInfo = method && url ? `${method} ${url}` : "";

  console.error(`${logContext} API Error:`, {
    status,
    statusText,
    message,
    request: requestInfo,
    responseData: axiosError?.response?.data,
  });
}

/**
 * Handles API errors by extracting the message and showing a toast notification
 * Also logs the error for debugging
 *
 * @param error - The error object from axios
 * @param defaultMessage - Default message if no error message is found
 * @param context - Additional context about where the error occurred (for logging)
 * @returns The extracted error message (useful if caller needs it)
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = "An error occurred. Please try again.",
  context?: string
): string {
  const errorMessage = extractErrorMessage(error, defaultMessage);

  // Log the error for debugging
  logApiError(error, context);

  // Return the user-friendly message - caller should show toast with: toast.error(errorMessage)
  return errorMessage;
}
