import { render, screen } from "@testing-library/react";
import DashboardRecognitionCard from "@/components/features/dashboard/dashboard/user/DashboardRecognitionCard";

describe("DashboardRecognitionCard", () => {
    const defaultProps = {
        id: "rev-1",
        from: "Alice",
        message: "Great teamwork on the project!",
        tags: ["Teamwork", "Dedication"],
        time: "2h ago",
    };

    it("renders from name and message", () => {
        render(<DashboardRecognitionCard {...defaultProps} />);
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(
            screen.getByText("“Great teamwork on the project!”")
        ).toBeInTheDocument();
    });

    it("renders time and context text", () => {
        render(<DashboardRecognitionCard {...defaultProps} />);
        expect(screen.getByText("2h ago")).toBeInTheDocument();
        expect(screen.getByText("recognised you")).toBeInTheDocument();
    });

    it("renders tags when provided", () => {
        render(<DashboardRecognitionCard {...defaultProps} />);
        expect(screen.getByText("Teamwork")).toBeInTheDocument();
        expect(screen.getByText("Dedication")).toBeInTheDocument();
    });

    it("does not break when tags array is empty", () => {
        render(<DashboardRecognitionCard {...defaultProps} tags={[]} />);
        expect(screen.queryByText("Teamwork")).not.toBeInTheDocument();
    });
});
