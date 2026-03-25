import { renderHook, act, waitFor } from "@testing-library/react";
import { useHistoryData } from "@/hooks/useHistoryData";
import { rewardsClient, walletClient } from "@/services/api-clients";

jest.mock("@/services/api-clients", () => ({
    rewardsClient: { get: jest.fn() },
    walletClient: { get: jest.fn() },
}));

jest.mock("@/services/auth-service", () => ({
    auth: {
        getUser: jest.fn(() => ({ employee_id: "emp-1" })),
    },
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "error"),
}));

const mockRewardsGet = rewardsClient.get as jest.MockedFunction<typeof rewardsClient.get>;
const mockWalletGet = walletClient.get as jest.MockedFunction<typeof walletClient.get>;

describe("useHistoryData", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock rewards history
        mockRewardsGet.mockResolvedValue({
            data: {
                data: [
                    {
                        history_id: "h1",
                        points: 100,
                        comment: "Great work",
                        granted_at: "2026-03-15T10:00:00Z",
                        reward_catalog: { reward_name: "Amazon Card", reward_code: "AMZ", category_name: "Electronics", category_code: "ELEC" },
                    },
                ],
                total_items: 1,
            },
        } as never);

        // Mock wallet
        mockWalletGet.mockImplementation((url: string) => {
            if (url.includes("/employees/")) {
                return Promise.resolve({ data: { wallet_id: "w1", employee_id: "emp-1", available_points: 500 } }) as never;
            }
            // Transactions
            return Promise.resolve({
                data: {
                    transactions: [
                        {
                            transaction_id: "t1",
                            wallet_id: "w1",
                            amount: 50,
                            transaction_type: { type_id: "tt1", code: "CREDIT", name: "Credit", is_credit: true },
                            description: "Points earned",
                            transaction_at: "2026-03-10T10:00:00Z",
                        },
                    ],
                    total: 1,
                },
            }) as never;
        });
    });

    it("fetches and merges history on mount", async () => {
        const { result } = renderHook(() => useHistoryData());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.allHistory.length).toBeGreaterThan(0);
    });

    it("starts with default filters", () => {
        const { result } = renderHook(() => useHistoryData());
        expect(result.current.selectedPeriod).toBe("All History");
        expect(result.current.selectedType).toBe("All");
    });

    it("filters by period", async () => {
        const { result } = renderHook(() => useHistoryData());

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => result.current.setSelectedPeriod("Redeem History"));

        // Only redemption items should appear
        expect(result.current.filteredHistory.every((item) => !!item.reward_catalog)).toBe(true);
    });

    it("clears filters", async () => {
        const { result } = renderHook(() => useHistoryData());

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => result.current.setSelectedPeriod("Redeem History"));
        act(() => result.current.clearFilters());

        expect(result.current.selectedPeriod).toBe("All History");
        expect(result.current.selectedType).toBe("All");
    });

    it("paginates results", async () => {
        const { result } = renderHook(() => useHistoryData());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.page).toBe(1);
        expect(result.current.totalPages).toBeGreaterThanOrEqual(1);
    });

    it("sets error on fetch failure", async () => {
        mockRewardsGet.mockRejectedValue(new Error("fail"));

        const { result } = renderHook(() => useHistoryData());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBeTruthy();
    });
});
