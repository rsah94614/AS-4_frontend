import {
    validateAuthEmail,
    validateAuthPassword,
    trimToMaxLength,
    MAX_EMAIL_LENGTH,
    MAX_PASSWORD_LENGTH,
} from "@/lib/auth-validation";

describe("validateAuthEmail", () => {
    it("returns error for empty email", () => {
        expect(validateAuthEmail("")).toBe("Email address is required");
    });

    it("returns error for email exceeding max length", () => {
        const longEmail = "a".repeat(MAX_EMAIL_LENGTH + 1);
        expect(validateAuthEmail(longEmail)).toContain("characters or fewer");
    });

    it("returns error for invalid email format", () => {
        expect(validateAuthEmail("not-an-email")).toBe("Please enter a valid email address");
        expect(validateAuthEmail("missing@domain")).toBe("Please enter a valid email address");
        expect(validateAuthEmail("@no-local.com")).toBe("Please enter a valid email address");
    });

    it("returns null for valid email", () => {
        expect(validateAuthEmail("user@example.com")).toBeNull();
        expect(validateAuthEmail("test.user@company.co")).toBeNull();
    });

    it("returns null for email at exactly max length", () => {
        const email = "a".repeat(MAX_EMAIL_LENGTH - "@b.c".length) + "@b.c";
        expect(validateAuthEmail(email)).toBeNull();
    });
});

describe("validateAuthPassword", () => {
    it("returns error for empty password", () => {
        expect(validateAuthPassword("")).toBe("Password is required");
    });

    it("returns error for password shorter than 8 characters", () => {
        expect(validateAuthPassword("Aa1bcde")).toBe("At least 8 characters required");
    });

    it("returns error for password exceeding max length", () => {
        const longPwd = "Aa1" + "x".repeat(MAX_PASSWORD_LENGTH - 2);
        expect(validateAuthPassword(longPwd)).toContain("characters or fewer");
    });

    it("returns error when missing uppercase letter", () => {
        expect(validateAuthPassword("abcdefg1")).toBe("Must include uppercase letter");
    });

    it("returns error when missing lowercase letter", () => {
        expect(validateAuthPassword("ABCDEFG1")).toBe("Must include lowercase letter");
    });

    it("returns error when missing a number", () => {
        expect(validateAuthPassword("Abcdefgh")).toBe("Must include a number");
    });

    it("returns null for valid password", () => {
        expect(validateAuthPassword("Passw0rd")).toBeNull();
        expect(validateAuthPassword("Test1234")).toBeNull();
    });
});

describe("trimToMaxLength", () => {
    it("returns the string unchanged when shorter than max", () => {
        expect(trimToMaxLength("hello", 10)).toBe("hello");
    });

    it("trims to max length", () => {
        expect(trimToMaxLength("hello world", 5)).toBe("hello");
    });

    it("handles empty string", () => {
        expect(trimToMaxLength("", 5)).toBe("");
    });
});
