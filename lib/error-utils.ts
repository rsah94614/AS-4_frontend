import axios from "axios";

// ── User-friendly messages for common HTTP status codes ───────────────────────
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "The request contains invalid data. Please review your inputs and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This entry conflicts with an existing record. Please use a different value.",
  422: "The data you entered is invalid. Please check your inputs and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again later.",
  502: "The server is temporarily unavailable. Please try again later.",
  503: "The service is currently unavailable. Please try again later.",
};

/**
 * Tries to build a readable message from a FastAPI validation-error array.
 * e.g. [{ loc: ["body", "points"], msg: "value is not a valid integer" }]
 */
function formatValidationErrors(detail: unknown[]): string | null {
  const messages = detail
    .map((entry) => {
      if (entry && typeof entry === "object") {
        const e = entry as Record<string, unknown>;
        const field = Array.isArray(e.loc)
          ? (e.loc as string[]).filter((l) => l !== "body").join(" → ")
          : null;
        const msg = typeof e.msg === "string" ? e.msg : null;
        if (field && msg) return `${field}: ${msg}`;
        if (msg) return msg;
      }
      return null;
    })
    .filter(Boolean);

  if (messages.length === 0) return null;
  if (messages.length === 1) return messages[0]!;
  return messages.join("; ");
}

/**
 * Standardizes error extraction across the entire application.
 * Handles Axios errors, Fetch Response errors, standard Error objects, and strings.
 */
export function extractErrorMessage(error: unknown, fallbackMessage = "An unexpected error occurred"): string {
  // 1. Handle Axios Errors
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    // API might return standard FastAPI error: { detail: "..." }
    const detail = data?.detail;
    if (typeof detail === "string") return detail;

    // Handle FastAPI validation error arrays
    if (Array.isArray(detail)) {
      const formatted = formatValidationErrors(detail);
      if (formatted) return formatted;
    }

    // Other common error formats { message: "..." } or { error: "..." }
    const dataMessage = data?.message || data?.error;
    if (typeof dataMessage === "string") return dataMessage;

    // Friendly message based on HTTP status code
    if (status && HTTP_STATUS_MESSAGES[status]) {
      return HTTP_STATUS_MESSAGES[status];
    }

    // Network / timeout errors
    if (error.code === "ERR_NETWORK") return "Unable to connect to the server. Please check your internet connection.";
    if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";

    return fallbackMessage;
  }

  // 2. Handle Standard JS Errors
  if (error instanceof Error) {
    return error.message;
  }

  // 3. Handle Strings
  if (typeof error === "string") {
    return error;
  }

  // 4. Handle Plain Objects (common in fetch responses)
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    if (Array.isArray(obj.detail)) {
      const formatted = formatValidationErrors(obj.detail);
      if (formatted) return formatted;
    }
  }

  // 5. Default Fallback
  return fallbackMessage;
}

/**
 * Optional: A standardized wrapper for structured Service responses.
 * Replaces `{ success: false, error: string }` boilerplates.
 */
export function createErrorResponse(error: unknown, fallbackMessage = "An unexpected error occurred") {
  return {
    success: false as const,
    error: extractErrorMessage(error, fallbackMessage),
  };
}
