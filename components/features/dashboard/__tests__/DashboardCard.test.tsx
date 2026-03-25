import { render, screen } from "@testing-library/react";
import DashboardCard from "@/components/features/dashboard/dashboard/user/DashboardCard";
import { Trophy } from "lucide-react";

describe("DashboardCard", () => {
    const defaultProps = {
        label: "Total Points",
        icon: Trophy,
        stat: {
            value: 1500,
            this_month: 112,
            last_month: 100,
        },
    };

    it("renders loading skeletons when loading is true", () => {
        const { container } = render(<DashboardCard {...defaultProps} loading={true} />);
        const skeletons = container.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it("renders the label and formatted value", () => {
        render(<DashboardCard {...defaultProps} />);
        expect(screen.getByText("Total Points")).toBeInTheDocument();
        expect(screen.getByText("1.5K")).toBeInTheDocument();
    });

    it("renders the icon", () => {
        const { container } = render(<DashboardCard {...defaultProps} />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
    });

    it("shows positive change calculated from this_month and last_month", () => {
        render(<DashboardCard {...defaultProps} />);
        expect(screen.getByText("+12%")).toBeInTheDocument();
    });

    it("shows negative change", () => {
        render(<DashboardCard {...defaultProps} stat={{ value: 1500, this_month: 95, last_month: 100 }} />);
        expect(screen.getByText("-5%")).toBeInTheDocument();
    });
});
