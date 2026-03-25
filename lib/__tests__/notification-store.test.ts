import { useNotificationStore } from "@/lib/notification-store";
import { employeesClient as notifClient } from "@/services/api-clients";
import { makeNotification } from "@/test-utils/mock-factories";

jest.mock("@/services/api-clients", () => ({
    employeesClient: {
        get: jest.fn(),
        put: jest.fn(),
    },
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((err, fallback) => fallback || "error"),
}));

const mockGet = notifClient.get as jest.MockedFunction<typeof notifClient.get>;
const mockPut = notifClient.put as jest.MockedFunction<typeof notifClient.put>;

describe("useNotificationStore", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useNotificationStore.setState({
            notifications: [],
            unreadCount: 0,
            loading: false,
            error: null,
        });
    });

    describe("fetchNotifications", () => {
        it("sets loading and fetches notifications", async () => {
            const notifs = [
                makeNotification({ notification_id: "1", is_read: false }),
                makeNotification({ notification_id: "2", is_read: true }),
            ];
            mockGet.mockResolvedValue({
                data: { notifications: notifs, total: 2 },
            } as never);

            await useNotificationStore.getState().fetchNotifications();

            const state = useNotificationStore.getState();
            expect(state.notifications).toHaveLength(2);
            expect(state.unreadCount).toBe(1);
            expect(state.loading).toBe(false);
        });

        it("sets error on failure", async () => {
            mockGet.mockRejectedValue(new Error("Network error"));

            await useNotificationStore.getState().fetchNotifications();

            const state = useNotificationStore.getState();
            expect(state.loading).toBe(false);
            expect(state.error).toBe("Failed to load notifications");
        });
    });

    describe("fetchUnreadCount", () => {
        it("updates unread count", async () => {
            mockGet.mockResolvedValue({ data: { unread_count: 5 } } as never);

            await useNotificationStore.getState().fetchUnreadCount();

            expect(useNotificationStore.getState().unreadCount).toBe(5);
        });

        it("silently ignores errors", async () => {
            mockGet.mockRejectedValue(new Error("fail"));

            await useNotificationStore.getState().fetchUnreadCount();

            expect(useNotificationStore.getState().error).toBeNull();
        });
    });

    describe("markOneAsRead", () => {
        it("updates the notification and decrements count", async () => {
            const notif = makeNotification({ notification_id: "n1", is_read: false });
            useNotificationStore.setState({ notifications: [notif], unreadCount: 1 });

            mockPut.mockResolvedValue({
                data: { ...notif, is_read: true, read_at: "2026-01-15T12:00:00Z" },
            } as never);

            await useNotificationStore.getState().markOneAsRead("n1");

            const state = useNotificationStore.getState();
            expect(state.notifications[0].is_read).toBe(true);
            expect(state.unreadCount).toBe(0);
        });

        it("does not go below 0 for unreadCount", async () => {
            useNotificationStore.setState({ notifications: [makeNotification({ notification_id: "n1" })], unreadCount: 0 });
            mockPut.mockResolvedValue({ data: makeNotification({ notification_id: "n1", is_read: true }) } as never);

            await useNotificationStore.getState().markOneAsRead("n1");

            expect(useNotificationStore.getState().unreadCount).toBe(0);
        });

        it("sets error on failure", async () => {
            useNotificationStore.setState({ notifications: [makeNotification({ notification_id: "n1" })], unreadCount: 1 });
            mockPut.mockRejectedValue(new Error("fail"));

            await useNotificationStore.getState().markOneAsRead("n1");

            expect(useNotificationStore.getState().error).toBe("Failed to mark as read");
        });
    });

    describe("markAllAsRead", () => {
        it("marks all notifications as read and sets count to 0", async () => {
            const notifs = [
                makeNotification({ notification_id: "n1", is_read: false }),
                makeNotification({ notification_id: "n2", is_read: false }),
            ];
            useNotificationStore.setState({ notifications: notifs, unreadCount: 2 });

            mockPut.mockResolvedValue({ data: { marked_read: 2 } } as never);

            await useNotificationStore.getState().markAllAsRead();

            const state = useNotificationStore.getState();
            expect(state.notifications.every((n) => n.is_read)).toBe(true);
            expect(state.unreadCount).toBe(0);
        });

        it("sets error on failure", async () => {
            mockPut.mockRejectedValue(new Error("fail"));

            await useNotificationStore.getState().markAllAsRead();

            expect(useNotificationStore.getState().error).toBe("Failed to mark all as read");
        });
    });
});
