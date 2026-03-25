import { getUnreadCount, getNotifications, markOneRead, markAllRead } from "@/services/notification-service";
import { employeesClient as notifClient } from "@/services/api-clients";
import { makeNotification } from "@/test-utils/mock-factories";

jest.mock("@/services/api-clients", () => ({
    employeesClient: {
        get: jest.fn(),
        put: jest.fn(),
    },
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "error"),
}));

const mockGet = notifClient.get as jest.MockedFunction<typeof notifClient.get>;
const mockPut = notifClient.put as jest.MockedFunction<typeof notifClient.put>;

describe("getUnreadCount", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns unread count", async () => {
        mockGet.mockResolvedValue({ data: { unread_count: 5 } } as never);
        const count = await getUnreadCount();
        expect(count).toBe(5);
    });

    it("returns 0 on error", async () => {
        mockGet.mockRejectedValue(new Error("fail"));
        const count = await getUnreadCount();
        expect(count).toBe(0);
    });
});

describe("getNotifications", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns notification list", async () => {
        const notifs = [makeNotification()];
        mockGet.mockResolvedValue({ data: { notifications: notifs, total: 1 } } as never);
        const result = await getNotifications();
        expect(result.notifications).toHaveLength(1);
        expect(result.total).toBe(1);
    });

    it("throws on error", async () => {
        mockGet.mockRejectedValue(new Error("fail"));
        await expect(getNotifications()).rejects.toThrow("Failed to load notifications");
    });
});

describe("markOneRead", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls PUT with notification ID", async () => {
        const notif = makeNotification({ notification_id: "n1", is_read: true });
        mockPut.mockResolvedValue({ data: notif } as never);
        const result = await markOneRead("n1");
        expect(result.is_read).toBe(true);
        expect(mockPut).toHaveBeenCalledWith("/notifications/n1/read", {});
    });

    it("throws on error", async () => {
        mockPut.mockRejectedValue(new Error("fail"));
        await expect(markOneRead("n1")).rejects.toThrow("Failed to mark as read");
    });
});

describe("markAllRead", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns marked count", async () => {
        mockPut.mockResolvedValue({ data: { marked_read: 3 } } as never);
        const count = await markAllRead();
        expect(count).toBe(3);
    });

    it("throws on error", async () => {
        mockPut.mockRejectedValue(new Error("fail"));
        await expect(markAllRead()).rejects.toThrow("Failed to mark all as read");
    });
});
