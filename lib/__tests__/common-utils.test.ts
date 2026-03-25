import { scoreColor } from "@/lib/common-utils";

describe("scoreColor", () => {
    it("returns Excellent for score >= 75", () => {
        const result = scoreColor(75);
        expect(result.label).toBe("Excellent");
        expect(result.text).toBe("text-emerald-600");
    });

    it("returns Excellent for score = 100", () => {
        expect(scoreColor(100).label).toBe("Excellent");
    });

    it("returns Good for score >= 50 and < 75", () => {
        const result = scoreColor(50);
        expect(result.label).toBe("Good");
        expect(result.text).toBe("text-amber-600");
    });

    it("returns Good for score = 74", () => {
        expect(scoreColor(74).label).toBe("Good");
    });

    it("returns Fair for score >= 25 and < 50", () => {
        const result = scoreColor(25);
        expect(result.label).toBe("Fair");
        expect(result.text).toBe("text-orange-600");
    });

    it("returns Fair for score = 49", () => {
        expect(scoreColor(49).label).toBe("Fair");
    });

    it("returns Needs Attention for score < 25", () => {
        const result = scoreColor(24);
        expect(result.label).toBe("Needs Attention");
        expect(result.text).toBe("text-red-600");
    });

    it("returns Needs Attention for score = 0", () => {
        expect(scoreColor(0).label).toBe("Needs Attention");
    });

    it("returns all expected shape keys", () => {
        const result = scoreColor(80);
        expect(result).toHaveProperty("text");
        expect(result).toHaveProperty("bg");
        expect(result).toHaveProperty("border");
        expect(result).toHaveProperty("bar");
        expect(result).toHaveProperty("label");
    });
});
