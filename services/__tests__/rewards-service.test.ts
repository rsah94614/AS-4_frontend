import {
    fetchCatalog,
    fetchAllActiveCatalog,
    fetchCategories,
    fetchWallet,
    redeemReward,
    fetchAdminCatalog,
    createCatalogItem,
    updateCatalogItem,
    restockCatalogItem,
    fetchAdminCategories,
    createCategory,
    updateCategory,
} from "@/services/rewards-service";
import { rewardsClient, walletClient } from "@/services/api-clients";

jest.mock("@/services/api-clients", () => ({
    rewardsClient: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
    },
    walletClient: {
        get: jest.fn(),
    },
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "error"),
}));

const mockRewardsGet = rewardsClient.get as jest.MockedFunction<typeof rewardsClient.get>;
const mockRewardsPost = rewardsClient.post as jest.MockedFunction<typeof rewardsClient.post>;
const mockRewardsPatch = rewardsClient.patch as jest.MockedFunction<typeof rewardsClient.patch>;
const mockWalletGet = walletClient.get as jest.MockedFunction<typeof walletClient.get>;

describe("fetchCatalog", () => {
    beforeEach(() => jest.clearAllMocks());

    it("filters active items and paginates client-side", async () => {
        const items = [
            { is_active: true, reward_name: "A" },
            { is_active: false, reward_name: "B" },
            { is_active: true, reward_name: "C" },
            { is_active: true, reward_name: "D" },
        ];
        mockRewardsGet.mockResolvedValue({
            data: { data: items, pagination: {} },
        } as never);

        const result = await fetchCatalog(1, 2);
        expect(result.data).toHaveLength(2);
        expect(result.pagination.total).toBe(3);
        expect(result.pagination.total_pages).toBe(2);
        expect(result.pagination.has_next).toBe(true);
    });

    it("returns page 2", async () => {
        const items = Array.from({ length: 5 }, (_, i) => ({ is_active: true, reward_name: `Item${i}` }));
        mockRewardsGet.mockResolvedValue({ data: { data: items, pagination: {} } } as never);

        const result = await fetchCatalog(2, 2);
        expect(result.data).toHaveLength(2);
        expect(result.pagination.current_page).toBe(2);
        expect(result.pagination.has_previous).toBe(true);
    });

    it("throws on error", async () => {
        mockRewardsGet.mockRejectedValue(new Error("fail"));
        await expect(fetchCatalog()).rejects.toThrow("Failed to load catalog");
    });
});

describe("fetchAllActiveCatalog", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns only active items", async () => {
        mockRewardsGet.mockResolvedValue({
            data: { data: [{ is_active: true }, { is_active: false }], pagination: {} },
        } as never);
        const result = await fetchAllActiveCatalog();
        expect(result).toHaveLength(1);
    });
});

describe("fetchCategories", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns categories", async () => {
        mockRewardsGet.mockResolvedValue({ data: [{ id: "c1", name: "Electronics" }] } as never);
        const result = await fetchCategories();
        expect(result).toHaveLength(1);
    });
});

describe("fetchWallet", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns wallet data", async () => {
        mockWalletGet.mockResolvedValue({ data: { balance: 500 } } as never);
        const result = await fetchWallet("emp-1");
        expect(result.balance).toBe(500);
        expect(mockWalletGet).toHaveBeenCalledWith("/employees/emp-1");
    });
});

describe("redeemReward", () => {
    beforeEach(() => jest.clearAllMocks());

    it("posts redemption request", async () => {
        mockRewardsPost.mockResolvedValue({ data: { success: true } } as never);
        const result = await redeemReward("w1", "c1", 100, "thanks");
        expect(result).toEqual({ success: true });
        expect(mockRewardsPost).toHaveBeenCalledWith("/redeem", {
            wallet_id: "w1",
            catalog_id: "c1",
            points: 100,
            comment: "thanks",
        });
    });
});

describe("admin catalog", () => {
    beforeEach(() => jest.clearAllMocks());

    it("fetchAdminCatalog calls correct endpoint", async () => {
        mockRewardsGet.mockResolvedValue({ data: { data: [], pagination: {} } } as never);
        await fetchAdminCatalog({ page: 2, size: 10, active_only: true });
        expect(mockRewardsGet).toHaveBeenCalledWith(expect.stringContaining("page=2"));
    });

    it("createCatalogItem posts payload", async () => {
        mockRewardsPost.mockResolvedValue({ data: { reward_name: "New" } } as never);
        const payload = {
            reward_name: "New",
            reward_code: "NEW",
            description: "desc",
            category_id: "c1",
            default_points: 100,
            min_points: 50,
            max_points: 200,
            available_stock: 10,
        };
        const result = await createCatalogItem(payload);
        expect(result.reward_name).toBe("New");
    });

    it("updateCatalogItem patches", async () => {
        mockRewardsPatch.mockResolvedValue({ data: { reward_name: "Updated" } } as never);
        await updateCatalogItem("cat1", { reward_name: "Updated" });
        expect(mockRewardsPatch).toHaveBeenCalledWith("/catalog/cat1", { reward_name: "Updated" });
    });

    it("restockCatalogItem patches stock", async () => {
        mockRewardsPatch.mockResolvedValue({ data: {} } as never);
        await restockCatalogItem("cat1", 50);
        expect(mockRewardsPatch).toHaveBeenCalledWith("/catalog/cat1/stock", { amount: 50 });
    });
});

describe("admin categories", () => {
    beforeEach(() => jest.clearAllMocks());

    it("fetchAdminCategories returns list", async () => {
        mockRewardsGet.mockResolvedValue({ data: [{ id: "c1" }] } as never);
        const result = await fetchAdminCategories();
        expect(result).toHaveLength(1);
    });

    it("createCategory posts", async () => {
        mockRewardsPost.mockResolvedValue({ data: { category_name: "New" } } as never);
        const result = await createCategory({ category_name: "New", category_code: "NEW" } as never);
        expect(result.category_name).toBe("New");
    });

    it("updateCategory patches", async () => {
        mockRewardsPatch.mockResolvedValue({ data: { category_name: "Updated" } } as never);
        const result = await updateCategory("c1", { category_name: "Updated" } as never);
        expect(result.category_name).toBe("Updated");
    });
});
