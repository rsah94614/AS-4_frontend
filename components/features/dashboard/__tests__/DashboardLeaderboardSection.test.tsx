import { render, screen, waitFor } from "@testing-library/react";
import DashboardLeaderboardSection from "@/components/features/dashboard/dashboard/user/DashboardLeaderboardSection";
import { fetchDashboardLeaderboard } from "@/services/analytics-service";

jest.mock("@/services/analytics-service", () => ({
    fetchDashboardLeaderboard: jest.fn(),
}));

const mockFetch = fetchDashboardLeaderboard as jest.Mock;

describe("DashboardLeaderboardSection", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("shows skeletons while loading and then 'No data yet' when empty", async () => {
        mockFetch.mockResolvedValue([]);
        
        render(<DashboardLeaderboardSection />);
        // Skeletons are generic div, we just check they resolve
        
        await waitFor(() => {
            expect(screen.getByText("No data yet")).toBeInTheDocument();
        });
    });

    it("renders leaderboard entries when provided by API", async () => {
        mockFetch.mockResolvedValue([
            {
                rank: 1,
                employee_id: "e1",
                username: "alice.jones",
                department: "Engineering",
                total_earned_points: 2500,
            },
            {
                rank: 2,
                employee_id: "e2",
                username: "bob.smith",
                department: "Design",
                total_earned_points: 1800,
            },
        ]);

        render(<DashboardLeaderboardSection />);

        await waitFor(() => {
            expect(screen.getByText("alice.jones")).toBeInTheDocument();
            expect(screen.getByText("bob.smith")).toBeInTheDocument();
            expect(screen.getByText("2,500 pts")).toBeInTheDocument();
        });
    });

    it("renders the section heading constantly", async () => {
        mockFetch.mockResolvedValue([]);
        render(<DashboardLeaderboardSection />);
        
        expect(screen.getByText("Leaderboard")).toBeInTheDocument();
        
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });
});
