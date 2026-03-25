import { todayStr, maxDobStr, initials, formatDate, normalizeId } from "@/lib/employee-utils";

describe("todayStr", () => {
    it("returns date in YYYY-MM-DD format", () => {
        const result = todayStr();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe("maxDobStr", () => {
    it("returns a date 18 years ago in YYYY-MM-DD format", () => {
        const result = maxDobStr();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        const maxYear = parseInt(result.split("-")[0]);
        const currentYear = new Date().getFullYear();
        expect(currentYear - maxYear).toBe(18);
    });
});

describe("initials", () => {
    it("returns initials for two-word name", () => {
        expect(initials("John Doe")).toBe("JD");
    });

    it("returns single initial for single name", () => {
        expect(initials("Alice")).toBe("A");
    });

    it("handles dot-separated names", () => {
        expect(initials("john.doe")).toBe("JD");
    });

    it("handles hyphenated names", () => {
        expect(initials("mary-jane")).toBe("MJ");
    });

    it("handles underscore-separated names", () => {
        expect(initials("test_user")).toBe("TU");
    });

    it("takes only first two parts", () => {
        expect(initials("A B C D")).toBe("AB");
    });
});

describe("formatDate", () => {
    it("returns dash for undefined", () => {
        expect(formatDate()).toBe("—");
    });

    it("returns dash for empty string", () => {
        expect(formatDate("")).toBe("—");
    });

    it("formats a valid date string", () => {
        const result = formatDate("2026-03-15");
        expect(result).toContain("Mar");
        expect(result).toContain("2026");
    });
});

describe("normalizeId", () => {
    it("returns empty string for null", () => {
        expect(normalizeId(null)).toBe("");
    });

    it("returns empty string for undefined", () => {
        expect(normalizeId(undefined)).toBe("");
    });

    it("normalizes a UUID string to lowercase", () => {
        const uuid = "A1B2C3D4-E5F6-1234-89AB-CDEF01234567";
        expect(normalizeId(uuid)).toBe(uuid.toLowerCase());
    });

    it("strips wrapping braces from UUID", () => {
        const uuid = "{a1b2c3d4-e5f6-1234-89ab-cdef01234567}";
        expect(normalizeId(uuid)).toBe("a1b2c3d4-e5f6-1234-89ab-cdef01234567");
    });

    it("extracts employee_id from object", () => {
        expect(normalizeId({ employee_id: "abc" })).toBe("abc");
    });

    it("extracts id from object", () => {
        expect(normalizeId({ id: "def" })).toBe("def");
    });

    it("extracts value from object", () => {
        expect(normalizeId({ value: "ghi" })).toBe("ghi");
    });

    it("prefers employee_id over id", () => {
        expect(normalizeId({ employee_id: "abc", id: "def" })).toBe("abc");
    });

    it("converts number to string", () => {
        expect(normalizeId(42)).toBe("42");
    });
});
