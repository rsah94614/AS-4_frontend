import {
    submitReview,
    listReviews,
    fetchMonthlyReviewState,
    invalidateMonthlyReviewState,
} from "@/services/review-orchestrator";
import { recognitionClient } from "@/services/api-clients";
import { requireAuthenticatedUserId } from "@/lib/api-utils";

jest.mock("@/services/api-clients", () => ({
    recognitionClient: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

jest.mock("@/lib/api-utils", () => ({
    requireAuthenticatedUserId: jest.fn(),
    categorizeFileUrls: jest.fn(() => ({})),
}));

jest.mock("@/services/s3", () => ({
    uploadToStorage: jest.fn().mockResolvedValue({ url: "https://s3/test.jpg" }),
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "error"),
}));

const mockGet = recognitionClient.get as jest.MockedFunction<typeof recognitionClient.get>;
const mockPost = recognitionClient.post as jest.MockedFunction<typeof recognitionClient.post>;
const mockAuthUserId = requireAuthenticatedUserId as jest.MockedFunction<typeof requireAuthenticatedUserId>;

function mockReviewsPage(reviews: Array<{ reviewer_id: string; receiver_id: string; review_at: string }>, hasNext = false) {
    return {
        data: {
            data: reviews,
            pagination: { has_next: hasNext, page: 1, page_size: 100, total: reviews.length },
        },
    } as never;
}

describe("review-orchestrator", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        invalidateMonthlyReviewState();
        mockAuthUserId.mockReturnValue("user-1");
    });

    describe("fetchMonthlyReviewState", () => {
        it("counts unique receivers reviewed this month", async () => {
            const thisMonth = new Date().toISOString();
            mockGet.mockResolvedValue(mockReviewsPage([
                { reviewer_id: "user-1", receiver_id: "r1", review_at: thisMonth },
                { reviewer_id: "user-1", receiver_id: "r2", review_at: thisMonth },
                { reviewer_id: "other", receiver_id: "r3", review_at: thisMonth },
            ]));

            const state = await fetchMonthlyReviewState();
            expect(state.reviewsUsed).toBe(2);
            expect(state.reviewedReceiverIds.has("r1")).toBe(true);
            expect(state.reviewedReceiverIds.has("r2")).toBe(true);
        });

        it("deduplicates concurrent calls", async () => {
            mockGet.mockResolvedValue(mockReviewsPage([]));

            const [r1, r2] = await Promise.all([
                fetchMonthlyReviewState(),
                fetchMonthlyReviewState(),
            ]);
            expect(r1).toBe(r2); // same promise
            expect(mockGet).toHaveBeenCalledTimes(1);
        });
    });

    describe("submitReview", () => {
        beforeEach(() => {
            // Mock fetchMonthlyReviewState to return empty state
            mockGet.mockResolvedValue(mockReviewsPage([]));
        });

        it("rejects self-review", async () => {
            await expect(
                submitReview({
                    receiverId: "user-1",
                    categoryIds: ["cat1"],
                    comment: "This is a valid comment",
                })
            ).rejects.toThrow("You cannot review yourself.");
        });

        it("rejects short comment", async () => {
            await expect(
                submitReview({
                    receiverId: "other",
                    categoryIds: ["cat1"],
                    comment: "short",
                })
            ).rejects.toThrow("Comment must be at least 10 characters.");
        });

        it("rejects empty categories", async () => {
            await expect(
                submitReview({
                    receiverId: "other",
                    categoryIds: [],
                    comment: "This is a valid comment",
                })
            ).rejects.toThrow("Please select at least one recognition category.");
        });

        it("rejects already-reviewed receiver", async () => {
            const thisMonth = new Date().toISOString();
            // Override mock to show user already reviewed "other"
            invalidateMonthlyReviewState();
            mockGet.mockResolvedValue(mockReviewsPage([
                { reviewer_id: "user-1", receiver_id: "other", review_at: thisMonth },
            ]));

            await expect(
                submitReview({
                    receiverId: "other",
                    categoryIds: ["cat1"],
                    comment: "This is a valid comment",
                })
            ).rejects.toThrow("You've already reviewed this person this month.");
        });

        it("submits a valid review", async () => {
            const reviewResponse = {
                review_id: "rev-1",
                reviewer_id: "user-1",
                receiver_id: "other",
                comment: "Great teamwork indeed",
            };
            mockPost.mockResolvedValue({ data: reviewResponse } as never);

            // After submission, the state refetch
            invalidateMonthlyReviewState();

            const result = await submitReview({
                receiverId: "other",
                categoryIds: ["cat1", "cat2"],
                comment: "Great teamwork indeed",
            });

            expect(mockPost).toHaveBeenCalledWith("/reviews", expect.objectContaining({
                receiver_id: "other",
                category_ids: ["cat1", "cat2"],
                comment: "Great teamwork indeed",
            }));
            expect(result.review).toEqual(reviewResponse);
        });
    });

    describe("listReviews", () => {
        it("fetches paginated reviews", async () => {
            mockGet.mockResolvedValue({
                data: { data: [{ review_id: "r1" }], pagination: { total: 1 } },
            } as never);

            const result = await listReviews(1, 10);
            expect(result.data).toHaveLength(1);
            expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("page=1&page_size=10"));
        });

        it("throws on error", async () => {
            mockGet.mockRejectedValue(new Error("fail"));
            await expect(listReviews()).rejects.toThrow("Failed to fetch reviews.");
        });
    });
});
