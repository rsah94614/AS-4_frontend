import { formatDate, formatTime } from "@/lib/wallet-utils";

describe("formatDate", () => {
    it("formats an ISO date to short US format", () => {
        const result = formatDate("2026-03-15T14:30:00Z");
        expect(result).toContain("Mar");
        expect(result).toContain("15");
        expect(result).toContain("2026");
    });
});

describe("formatTime", () => {
    it("formats an ISO date to time string", () => {
        const result = formatTime("2026-03-15T14:30:00Z");
        // Result should be a time string like "02:30 PM" or "14:30"
        expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
});
