import {
    extractApiError,
    validateReviewInput,
    requireAuthenticatedUserId,
    categorizeFileUrls,
    SENSITIVE_FIELD_NAMES,
} from "@/lib/api-utils";
import { auth } from "@/services/auth-service";
import { makeUser } from "@/test-utils/mock-auth";

jest.mock("@/services/auth-service", () => ({
    auth: {
        getAccessToken: jest.fn(),
        getRefreshToken: jest.fn(),
        getUser: jest.fn(),
        isTokenExpired: jest.fn(),
        isAuthenticated: jest.fn(),
        clearTokens: jest.fn(),
        setTokens: jest.fn(),
        refreshAccessToken: jest.fn(),
    },
}));

jest.mock("@/lib/logger-store", () => ({
    useLoggerStore: {
        getState: () => ({ addLog: jest.fn() }),
    },
}));

const mockGetUser = auth.getUser as jest.MockedFunction<typeof auth.getUser>;

describe("extractApiError", () => {
    it("delegates to extractErrorMessage with custom fallback", () => {
        expect(extractApiError(new Error("oops"))).toBe("oops");
    });

    it("uses default fallback", () => {
        expect(extractApiError(null)).toBe("Request failed");
    });
});

describe("validateReviewInput", () => {
    it("throws for rating below 1", () => {
        expect(() => validateReviewInput(0, "Valid comment here")).toThrow("Rating must be between 1 and 5.");
    });

    it("throws for rating above 5", () => {
        expect(() => validateReviewInput(6, "Valid comment here")).toThrow("Rating must be between 1 and 5.");
    });

    it("throws for comment shorter than 10 chars", () => {
        expect(() => validateReviewInput(3, "short")).toThrow("Comment must be at least 10 characters.");
    });

    it("throws for comment longer than 2000 chars", () => {
        const longComment = "a".repeat(2001);
        expect(() => validateReviewInput(3, longComment)).toThrow("Comment must not exceed 2000 characters.");
    });

    it("does not throw for valid input", () => {
        expect(() => validateReviewInput(3, "This is a valid comment.")).not.toThrow();
    });

    it("trims comment before checking length", () => {
        expect(() => validateReviewInput(3, "   short   ")).toThrow("Comment must be at least 10 characters.");
    });
});

describe("requireAuthenticatedUserId", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns employee_id when user is authenticated", () => {
        mockGetUser.mockReturnValue(makeUser({ employee_id: "emp-123" }));
        expect(requireAuthenticatedUserId()).toBe("emp-123");
    });

    it("throws when no user", () => {
        mockGetUser.mockReturnValue(null);
        expect(() => requireAuthenticatedUserId()).toThrow("Authentication required.");
    });

    it("throws when user has no employee_id", () => {
        mockGetUser.mockReturnValue(makeUser({ employee_id: "" }));
        expect(() => requireAuthenticatedUserId()).toThrow("Authentication required.");
    });
});

describe("categorizeFileUrls", () => {
    it("returns first image and first video URL", () => {
        const uploads = [
            { kind: "image", url: "https://s3/img1.jpg" },
            { kind: "video", url: "https://s3/vid1.mp4" },
            { kind: "image", url: "https://s3/img2.jpg" },
        ];
        const result = categorizeFileUrls(uploads);
        expect(result.imageUrl).toBe("https://s3/img1.jpg");
        expect(result.videoUrl).toBe("https://s3/vid1.mp4");
    });

    it("returns only imageUrl when no video", () => {
        const uploads = [{ kind: "image", url: "https://s3/img.jpg" }];
        const result = categorizeFileUrls(uploads);
        expect(result.imageUrl).toBe("https://s3/img.jpg");
        expect(result.videoUrl).toBeUndefined();
    });

    it("returns empty object for empty array", () => {
        const result = categorizeFileUrls([]);
        expect(result.imageUrl).toBeUndefined();
        expect(result.videoUrl).toBeUndefined();
    });
});

describe("SENSITIVE_FIELD_NAMES", () => {
    it("includes expected sensitive fields", () => {
        expect(SENSITIVE_FIELD_NAMES.has("password")).toBe(true);
        expect(SENSITIVE_FIELD_NAMES.has("refresh_token")).toBe(true);
        expect(SENSITIVE_FIELD_NAMES.has("authorization")).toBe(true);
        expect(SENSITIVE_FIELD_NAMES.has("x-api-key")).toBe(true);
    });

    it("does not include non-sensitive fields", () => {
        expect(SENSITIVE_FIELD_NAMES.has("username")).toBe(false);
        expect(SENSITIVE_FIELD_NAMES.has("email")).toBe(false);
    });
});
