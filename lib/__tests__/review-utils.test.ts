import { RATING_LABELS, RATING_COLORS, fmtDate } from "@/lib/review-utils";

describe("RATING_LABELS", () => {
    it("maps 1-5 to expected labels", () => {
        expect(RATING_LABELS[1]).toBe("Poor");
        expect(RATING_LABELS[2]).toBe("Below Average");
        expect(RATING_LABELS[3]).toBe("Good");
        expect(RATING_LABELS[4]).toBe("Great");
        expect(RATING_LABELS[5]).toBe("Exceptional");
    });
});

describe("RATING_COLORS", () => {
    it("maps 1-5 to expected color classes", () => {
        expect(RATING_COLORS[1]).toContain("red");
        expect(RATING_COLORS[2]).toContain("orange");
        expect(RATING_COLORS[3]).toContain("amber");
        expect(RATING_COLORS[4]).toContain("green");
        expect(RATING_COLORS[5]).toContain("indigo");
    });
});

describe("fmtDate", () => {
    it("formats an ISO date string", () => {
        const result = fmtDate("2026-03-15T12:00:00Z");
        expect(result).toContain("Mar");
        expect(result).toContain("15");
        expect(result).toContain("2026");
    });

    it("formats another date", () => {
        const result = fmtDate("2025-12-25T00:00:00Z");
        expect(result).toContain("Dec");
        expect(result).toContain("25");
        expect(result).toContain("2025");
    });
});
