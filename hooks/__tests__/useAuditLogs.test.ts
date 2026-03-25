import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { fetchAuditLogs } from "@/services/org-service";

jest.mock("@/services/org-service", () => ({
    fetchAuditLogs: jest.fn(),
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "error"),
}));

const mockFetchAuditLogs = fetchAuditLogs as jest.MockedFunction<typeof fetchAuditLogs>;

describe("useAuditLogs", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetchAuditLogs.mockResolvedValue({
            data: [{ audit_log_id: "a1", table_name: "employees", operation_type: "INSERT" }] as never,
            pagination: { total: 1, page: 1, limit: 10 } as never,
        });
    });

    it("fetches logs on mount", async () => {
        const { result } = renderHook(() => useAuditLogs());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.logs).toHaveLength(1);
        expect(mockFetchAuditLogs).toHaveBeenCalledTimes(1);
    });

    it("starts with loading true", () => {
        const { result } = renderHook(() => useAuditLogs());
        expect(result.current.loading).toBe(true);
    });

    it("applies filters and resets page", async () => {
        const { result } = renderHook(() => useAuditLogs());

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.applyFilters({
                tableName: "employees",
                operationType: "INSERT",
                performedBy: "",
                startDate: "",
                endDate: "",
            });
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.page).toBe(1);
    });

    it("clears filters", async () => {
        const { result } = renderHook(() => useAuditLogs());

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.clearFilters();
        });

        expect(result.current.filters.tableName).toBe("");
        expect(result.current.filters.operationType).toBe("");
    });

    it("sets error on fetch failure", async () => {
        mockFetchAuditLogs.mockRejectedValue(new Error("fail"));

        const { result } = renderHook(() => useAuditLogs());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe("Failed to load audit logs.");
        expect(result.current.logs).toHaveLength(0);
    });

    it("sets session expired error on 401", async () => {
        const error = Object.assign(new Error("Unauthorized"), { response: { status: 401 } });
        mockFetchAuditLogs.mockRejectedValue(error);

        const { result } = renderHook(() => useAuditLogs());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toContain("session has expired");
    });

    it("supports page changes", async () => {
        const { result } = renderHook(() => useAuditLogs());

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.setPage(2);
        });

        expect(result.current.page).toBe(2);
    });
});
