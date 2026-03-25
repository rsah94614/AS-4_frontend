import type { Notification } from "@/types/notification-types";
import type { HistoryItem } from "@/types/history-types";
import type { LogEntry } from "@/lib/logger-store";

export function makeNotification(overrides: Partial<Notification> = {}): Notification {
    return {
        notification_id: "notif-1",
        employee_id: "emp-1",
        title: "Test Notification",
        message: "Test message",
        type: "REVIEW",
        is_read: false,
        email_sent: false,
        created_at: "2026-01-15T10:00:00Z",
        read_at: null,
        ...overrides,
    };
}

export function makeHistoryItem(overrides: Partial<HistoryItem> = {}): HistoryItem {
    return {
        history_id: "hist-1",
        points: 100,
        comment: "Great work",
        granted_at: "2026-01-15T10:00:00Z",
        ...overrides,
    };
}

export function makeLogEntry(overrides: Partial<LogEntry> = {}): LogEntry {
    return {
        id: "log-1",
        timestamp: "2026-01-15T10:00:00Z",
        method: "GET",
        url: "http://localhost:8001/v1/test",
        requestHeaders: {},
        requestBody: null,
        requestParams: {},
        status: 200,
        responseData: null,
        responseHeaders: {},
        duration: 100,
        error: null,
        errorStack: null,
        ...overrides,
    };
}

export function makeAxiosError(status: number, data: unknown = {}) {
    const error = new Error("Request failed") as Error & {
        isAxiosError: boolean;
        response: { status: number; data: unknown };
    };
    error.isAxiosError = true;
    error.response = { status, data };
    return error;
}
