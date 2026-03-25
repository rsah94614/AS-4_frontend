import { renderHook, act } from "@testing-library/react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationStore } from "@/lib/notification-store";

// Mock the zustand store
jest.mock("@/lib/notification-store", () => {
    const mockFetchNotifications = jest.fn().mockResolvedValue(undefined);
    const mockFetchUnreadCount = jest.fn().mockResolvedValue(undefined);
    const mockMarkOneAsRead = jest.fn().mockResolvedValue(undefined);
    const mockMarkAllAsRead = jest.fn().mockResolvedValue(undefined);

    const store = {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
        fetchNotifications: mockFetchNotifications,
        fetchUnreadCount: mockFetchUnreadCount,
        markOneAsRead: mockMarkOneAsRead,
        markAllAsRead: mockMarkAllAsRead,
    };

    const useNotificationStore = jest.fn(() => store);
    useNotificationStore.getState = jest.fn(() => store);

    return { useNotificationStore };
});

describe("useNotifications", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("returns notification state from store", () => {
        const { result } = renderHook(() => useNotifications());
        expect(result.current.notifications).toEqual([]);
        expect(result.current.unreadCount).toBe(0);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("calls fetchNotifications on mount", async () => {
        const store = useNotificationStore.getState();
        renderHook(() => useNotifications(25));

        await act(async () => {});
        expect(store.fetchNotifications).toHaveBeenCalledWith(25);
    });

    it("exposes markOne that delegates to store", async () => {
        const store = useNotificationStore.getState();
        const { result } = renderHook(() => useNotifications());

        await act(async () => {
            await result.current.markOne("n1");
        });
        expect(store.markOneAsRead).toHaveBeenCalledWith("n1");
    });

    it("exposes markAll that delegates to store", async () => {
        const store = useNotificationStore.getState();
        const { result } = renderHook(() => useNotifications());

        await act(async () => {
            await result.current.markAll();
        });
        expect(store.markAllAsRead).toHaveBeenCalled();
    });

    it("sets up polling interval", async () => {
        const store = useNotificationStore.getState();
        renderHook(() => useNotifications());

        await act(async () => {});

        // Advance by 30 seconds (POLL_INTERVAL_MS)
        await act(async () => {
            jest.advanceTimersByTime(30000);
        });

        expect(store.fetchUnreadCount).toHaveBeenCalled();
    });

    it("cleans up interval on unmount", async () => {
        const { unmount } = renderHook(() => useNotifications());
        await act(async () => {});

        unmount();

        const store = useNotificationStore.getState();
        const callCountBefore = (store.fetchUnreadCount as jest.Mock).mock.calls.length;

        await act(async () => {
            jest.advanceTimersByTime(60000);
        });

        // No additional calls after unmount
        expect((store.fetchUnreadCount as jest.Mock).mock.calls.length).toBe(callCountBefore);
    });
});
