import { formatNumber, formatMonthComparison } from "@/lib/dashboard-utils";

describe("formatNumber", () => {
    it("returns dash for null", () => {
        expect(formatNumber(null)).toBe("—");
    });

    it("formats millions", () => {
        expect(formatNumber(2_500_000)).toBe("2.5M");
        expect(formatNumber(1_000_000)).toBe("1.0M");
    });

    it("formats thousands", () => {
        expect(formatNumber(1_500)).toBe("1.5K");
        expect(formatNumber(1_000)).toBe("1.0K");
        expect(formatNumber(99_999)).toBe("100.0K");
    });

    it("returns locale string for small numbers", () => {
        expect(formatNumber(0)).toBe("0");
        expect(formatNumber(42)).toBe("42");
        expect(formatNumber(999)).toBe("999");
    });
});

describe("formatMonthComparison", () => {
    it("returns dash for null", () => {
        expect(formatMonthComparison(null, null)).toBe("—");
    });

    it("formats positive growth with + sign", () => {
        expect(formatMonthComparison(112, 100)).toBe("+12%");
        expect(formatMonthComparison(100, 100)).toBe("+0%");
    });

    it("formats negative growth without extra sign", () => {
        expect(formatMonthComparison(95, 100)).toBe("-5%");
    });
});
