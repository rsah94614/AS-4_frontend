import {
    matchesPeriod,
    matchesType,
    getMessage,
    getHistoryCategoryValue,
    getHistoryCategoryLabel,
} from "@/lib/history-utils";
import { makeHistoryItem } from "@/test-utils/mock-factories";

describe("matchesPeriod", () => {
    it('returns true for "All History" regardless of item', () => {
        expect(matchesPeriod(makeHistoryItem(), "All History")).toBe(true);
        expect(matchesPeriod(makeHistoryItem({ reward_catalog: { reward_name: "Gift", reward_code: "G1" } }), "All History")).toBe(true);
    });

    it('returns true for "Redeem History" only when reward_catalog exists', () => {
        expect(matchesPeriod(makeHistoryItem({ reward_catalog: { reward_name: "Gift", reward_code: "G1" } }), "Redeem History")).toBe(true);
        expect(matchesPeriod(makeHistoryItem(), "Redeem History")).toBe(false);
    });

    it('returns true for "Points History" only when reward_catalog is absent', () => {
        expect(matchesPeriod(makeHistoryItem(), "Points History")).toBe(true);
        expect(matchesPeriod(makeHistoryItem({ reward_catalog: { reward_name: "Gift", reward_code: "G1" } }), "Points History")).toBe(false);
    });
});

describe("matchesType", () => {
    it('returns true for "All" type', () => {
        expect(matchesType(makeHistoryItem(), "All")).toBe(true);
    });

    it("matches by category code", () => {
        const item = makeHistoryItem({
            reward_catalog: { reward_name: "Gift", reward_code: "G1", category_code: "ELECTRONICS" },
        });
        expect(matchesType(item, "ELECTRONICS")).toBe(true);
        expect(matchesType(item, "OTHER")).toBe(false);
    });

    it("matches case-insensitively", () => {
        const item = makeHistoryItem({
            reward_catalog: { reward_name: "Gift", reward_code: "G1", category_code: "Electronics" },
        });
        expect(matchesType(item, "electronics")).toBe(true);
    });
});

describe("getMessage", () => {
    it('returns redemption message when reward_catalog exists', () => {
        const item = makeHistoryItem({
            reward_catalog: { reward_name: "Amazon Voucher", reward_code: "AV1" },
        });
        expect(getMessage(item)).toBe('You redeemed "Amazon Voucher"');
    });

    it("returns comment when no reward_catalog", () => {
        const item = makeHistoryItem({ comment: "Great teamwork" });
        expect(getMessage(item)).toBe("Great teamwork");
    });

    it("returns fallback when no reward_catalog and no comment", () => {
        const item = makeHistoryItem({ comment: undefined });
        expect(getMessage(item)).toBe("Points awarded");
    });
});

describe("getHistoryCategoryValue", () => {
    it("returns category_code when present", () => {
        const item = makeHistoryItem({
            reward_catalog: { reward_name: "X", reward_code: "X1", category_code: "TECH", category_name: "Technology" },
        });
        expect(getHistoryCategoryValue(item)).toBe("TECH");
    });

    it("falls back to category_name when category_code is absent", () => {
        const item = makeHistoryItem({
            reward_catalog: { reward_name: "X", reward_code: "X1", category_name: "Technology" },
        });
        expect(getHistoryCategoryValue(item)).toBe("Technology");
    });

    it("returns null when no reward_catalog", () => {
        expect(getHistoryCategoryValue(makeHistoryItem())).toBeNull();
    });
});

describe("getHistoryCategoryLabel", () => {
    it("returns category_name when present", () => {
        const item = makeHistoryItem({
            reward_catalog: { reward_name: "X", reward_code: "X1", category_code: "TECH", category_name: "Technology" },
        });
        expect(getHistoryCategoryLabel(item)).toBe("Technology");
    });

    it("falls back to category_code when category_name is absent", () => {
        const item = makeHistoryItem({
            reward_catalog: { reward_name: "X", reward_code: "X1", category_code: "TECH" },
        });
        expect(getHistoryCategoryLabel(item)).toBe("TECH");
    });

    it("returns null when no reward_catalog", () => {
        expect(getHistoryCategoryLabel(makeHistoryItem())).toBeNull();
    });
});
