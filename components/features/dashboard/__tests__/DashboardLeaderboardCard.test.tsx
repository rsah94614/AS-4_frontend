import { render, screen } from "@testing-library/react";
import DashboardLeaderboardCard from "@/components/features/dashboard/dashboard/user/DashboardLeaderboardCard";

describe("DashboardLeaderboardCard", () => {
    const defaultProps = {
        rank: 2,
        name: "Jane Smith",
        initials: "JS",
        points: 1500,
    };

    it("renders rank, name, and formatted points", () => {
        render(<DashboardLeaderboardCard {...defaultProps} />);
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.getByText("1,500")).toBeInTheDocument();
    });
});
