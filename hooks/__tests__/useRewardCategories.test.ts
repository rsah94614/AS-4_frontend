import { renderHook, act, waitFor } from "@testing-library/react";
import { useRewardCategories } from "@/hooks/useRewardCategories";
import { rewardsClient } from "@/services/api-clients";

jest.mock("@/services/api-clients", () => ({
    rewardsClient: {
        get: jest.fn(),
    },
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "error"),
}));

const mockGet = rewardsClient.get as jest.MockedFunction<typeof rewardsClient.get>;

const mockCategories = [
    { category_id: "c1", category_name: "Leadership", category_code: "LEAD", is_active: true },
    { category_id: "c2", category_name: "Teamwork", category_code: "TEAM", is_active: true },
    { category_id: "c3", category_name: "Archived", category_code: "ARCH", is_active: false },
];

describe("useRewardCategories", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGet.mockResolvedValue({ data: mockCategories } as never);
    });

    it("fetches categories on mount", async () => {
        const { result } = renderHook(() => useRewardCategories());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.categories).toHaveLength(3);
    });

    it("filters by active status", async () => {
        const { result } = renderHook(() => useRewardCategories());

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.setFilterState("active");
        });

        expect(result.current.filtered.every((c: { is_active: boolean }) => c.is_active)).toBe(true);
    });

    it("filters by inactive status", async () => {
        const { result } = renderHook(() => useRewardCategories());

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.setFilterState("inactive");
        });

        expect(result.current.filtered.every((c: { is_active: boolean }) => !c.is_active)).toBe(true);
    });

    it("searches by name", async () => {
        const { result } = renderHook(() => useRewardCategories());

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.setSearch("leader");
        });

        expect(result.current.filtered).toHaveLength(1);
        expect(result.current.filtered[0].category_name).toBe("Leadership");
    });

    it("counts active categories", async () => {
        const { result } = renderHook(() => useRewardCategories());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.activeCount).toBe(2);
    });

    it("manages modal state", async () => {
        const { result } = renderHook(() => useRewardCategories());

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => result.current.openCreate());
        expect(result.current.modal).toBe("create");

        act(() => result.current.closeModal());
        expect(result.current.modal).toBeNull();
    });

    it("sets error on fetch failure", async () => {
        mockGet.mockRejectedValue(new Error("fail"));

        const { result } = renderHook(() => useRewardCategories());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe("Failed to load categories.");
    });
});
