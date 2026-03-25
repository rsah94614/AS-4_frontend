import {
    fetchDashboardPlatformStats,
    fetchDashboardRecentReviews,
    fetchDashboardLeaderboard,
    fetchTeamsSummary,
    fetchRecognitionUsers,
    fetchRecognitionTeams,
    fetchRecognitionTrend,
    fetchParticipation,
    fetchTeamReport,
    fetchDashboardAggregate,
} from "@/services/analytics-service";
import { analyticsClient } from "@/services/api-clients";

jest.mock("@/services/api-clients", () => ({
    analyticsClient: {
        get: jest.fn(),
    },
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "error"),
}));

const mockGet = analyticsClient.get as jest.MockedFunction<typeof analyticsClient.get>;

describe("analytics-service", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("fetchDashboardPlatformStats", () => {
        it("returns data on success", async () => {
            mockGet.mockResolvedValue({ data: { total_reviews: 100 } } as never);
            const result = await fetchDashboardPlatformStats();
            expect(result).toEqual({ total_reviews: 100 });
        });

        it("returns null on error", async () => {
            mockGet.mockRejectedValue(new Error("fail"));
            const result = await fetchDashboardPlatformStats();
            expect(result).toBeNull();
        });
    });

    describe("fetchDashboardRecentReviews", () => {
        it("returns reviews", async () => {
            mockGet.mockResolvedValue({ data: [{ id: "r1" }] } as never);
            const result = await fetchDashboardRecentReviews();
            expect(result).toHaveLength(1);
        });

        it("returns null on error", async () => {
            mockGet.mockRejectedValue(new Error("fail"));
            expect(await fetchDashboardRecentReviews()).toBeNull();
        });
    });

    describe("fetchDashboardLeaderboard", () => {
        it("returns leaderboard entries", async () => {
            mockGet.mockResolvedValue({ data: [{ username: "alice", points: 500 }] } as never);
            const result = await fetchDashboardLeaderboard();
            expect(result).toHaveLength(1);
        });
    });

    describe("fetchTeamsSummary", () => {
        it("returns teams", async () => {
            mockGet.mockResolvedValue({ data: [{ team: "Engineering" }] } as never);
            expect(await fetchTeamsSummary()).toHaveLength(1);
        });
    });

    describe("fetchRecognitionUsers", () => {
        it("passes range and pagination params", async () => {
            mockGet.mockResolvedValue({ data: { data: [], total: 0 } } as never);
            await fetchRecognitionUsers("month", 2, 50);
            expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("range=month&page=2&limit=50"));
        });
    });

    describe("fetchRecognitionTeams", () => {
        it("calls correct endpoint", async () => {
            mockGet.mockResolvedValue({ data: { data: [] } } as never);
            await fetchRecognitionTeams("quarter");
            expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("recognition/teams"));
        });
    });

    describe("fetchRecognitionTrend", () => {
        it("passes range param", async () => {
            mockGet.mockResolvedValue({ data: { trend: [] } } as never);
            await fetchRecognitionTrend("3m");
            expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("range=3m"));
        });
    });

    describe("fetchParticipation", () => {
        it("returns participation data", async () => {
            mockGet.mockResolvedValue({ data: { participation_rate: 0.75 } } as never);
            expect(await fetchParticipation()).toEqual({ participation_rate: 0.75 });
        });
    });

    describe("fetchTeamReport", () => {
        it("fetches by department ID", async () => {
            mockGet.mockResolvedValue({ data: { department: "Engineering" } } as never);
            await fetchTeamReport("dept-1");
            expect(mockGet).toHaveBeenCalledWith("/dashboard/teams/dept-1");
        });
    });

    describe("fetchDashboardAggregate", () => {
        it("aggregates all dashboard data in parallel", async () => {
            mockGet.mockResolvedValue({ data: {} } as never);
            const result = await fetchDashboardAggregate();
            expect(result).toHaveProperty("platformStats");
            expect(result).toHaveProperty("recentReviews");
            expect(result).toHaveProperty("leaderboard");
            expect(result).toHaveProperty("teams");
            // 4 parallel calls
            expect(mockGet).toHaveBeenCalledTimes(4);
        });
    });
});
