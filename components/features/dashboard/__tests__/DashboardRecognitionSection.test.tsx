import { render, screen, waitFor } from "@testing-library/react";
import DashboardRecognitionSection from "@/components/features/dashboard/dashboard/user/DashboardRecognitionSection";
import { fetchDashboardRecentReviews } from "@/services/analytics-service";

jest.mock("@/services/analytics-service", () => ({
    fetchDashboardRecentReviews: jest.fn(),
}));

const mockFetch = fetchDashboardRecentReviews as jest.Mock;

describe("DashboardRecognitionSection", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("shows 'No reviews yet' when empty and not loading", async () => {
        mockFetch.mockResolvedValue([]);
        render(<DashboardRecognitionSection />);
        
        await waitFor(() => {
            expect(screen.getByText("No reviews yet")).toBeInTheDocument();
        });
    });

    it("renders recognition cards when reviews are fetched", async () => {
        mockFetch.mockResolvedValue([
            {
                review_id: "r1",
                reviewer_name: "alice.jones",
                rating: 5,
                comment: "Excellent presentation!",
                review_at: new Date().toISOString(),
                tags: ["Presentation"],
            },
            {
                review_id: "r2",
                reviewer_name: "bob_smith",
                rating: 3,
                comment: "Good effort overall.",
                review_at: new Date(Date.now() - 3600_000).toISOString(), // 1h ago
                tags: [],
            },
        ]);

        render(<DashboardRecognitionSection />);

        await waitFor(() => {
            expect(screen.getByText("alice.jones")).toBeInTheDocument();
            expect(screen.getByText("bob_smith")).toBeInTheDocument();
            expect(screen.getByText("“Excellent presentation!”")).toBeInTheDocument();
            expect(screen.getByText("Presentation")).toBeInTheDocument();
        });
    });

    it("renders the section heading", async () => {
        mockFetch.mockResolvedValue([]);
        render(<DashboardRecognitionSection />);
        
        expect(screen.getByText("Recent Reviews")).toBeInTheDocument();
        
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });
});
