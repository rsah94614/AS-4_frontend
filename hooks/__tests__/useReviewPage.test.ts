import { renderHook, waitFor } from "@testing-library/react";
import { useReviewPage } from "@/hooks/useReviewPage";

jest.mock("@/services/s3", () => ({
    uploadToStorage: jest.fn().mockResolvedValue({ url: "https://s3/test.jpg" }),
}));

jest.mock("@/services/employee-service", () => ({
    getTeamMembersForUI: jest.fn().mockResolvedValue({
        loggedInUser: { id: "me", name: "Me" },
        teamMembers: [{ id: "peer1", name: "Peer 1" }],
        teamLeader: { id: "mgr", name: "Manager" },
    }),
}));

jest.mock("@/lib/api-utils", () => ({
    requireAuthenticatedUserId: jest.fn().mockReturnValue("me"),
    categorizeFileUrls: jest.fn(() => ({})),
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "error"),
}));

jest.mock("@/services/api-clients", () => ({
    recognitionClient: {
        get: jest.fn().mockResolvedValue({
            data: {
                data: [],
                pagination: { total: 0, page: 1, page_size: 20, total_pages: 0 },
            },
        }),
        post: jest.fn().mockResolvedValue({ data: { review_id: "rev-1" } }),
    },
}));

describe("useReviewPage", () => {
    beforeEach(() => jest.clearAllMocks());

    it("initializes with loading state", () => {
        const { result } = renderHook(() => useReviewPage());
        expect(result.current.loadingData).toBe(true);
    });

    it("sets myId from auth", () => {
        const { result } = renderHook(() => useReviewPage());
        expect(result.current.myId).toBe("me");
    });

    it("loads team data after mount", async () => {
        const { result } = renderHook(() => useReviewPage());

        await waitFor(() => expect(result.current.loadingData).toBe(false));
        expect(result.current.teamMembers).toHaveLength(1);
        expect(result.current.teamLeader?.id).toBe("mgr");
    });

    it("has initial form state", () => {
        const { result } = renderHook(() => useReviewPage());
        expect(result.current.receiverId).toBe("");
        expect(result.current.categoryIds).toEqual([]);
        expect(result.current.comment).toBe("");
        expect(result.current.files).toEqual([]);
        expect(result.current.submitting).toBe(false);
    });

    it("starts in compose view", () => {
        const { result } = renderHook(() => useReviewPage());
        expect(result.current.view).toBe("compose");
    });

    it("has default list tab of all", () => {
        const { result } = renderHook(() => useReviewPage());
        expect(result.current.listTab).toBe("all");
    });
});
